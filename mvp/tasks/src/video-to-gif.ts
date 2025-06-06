import { task, logger } from "@trigger.dev/sdk/v3";
import ffmpeg from "fluent-ffmpeg";
import { Readable } from "node:stream";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import { put, del } from "@vercel/blob";

export interface VideoToGifPayload {
  videoUrl: string;
  userId: string;
  sessionId: string;
}

export interface VideoToGifResult {
  gifUrl: string;
  duration: number;
  size: number;
}

export const videoToGif = task({
  id: "video-to-gif",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 10000,
    factor: 2,
  },
  run: async (payload: VideoToGifPayload): Promise<VideoToGifResult> => {
    const { videoUrl, userId, sessionId } = payload;
    
    logger.log("Starting video to GIF conversion", { videoUrl, userId, sessionId });
    
    // Create temporary file paths
    const tempDir = os.tmpdir();
    const tempVideoPath = path.join(tempDir, `video_${Date.now()}.mp4`);
    const tempGifPath = path.join(tempDir, `output_${Date.now()}.gif`);
    
    try {
      // Download video
      logger.log("Downloading video...");
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Failed to download video: ${response.statusText}`);
      }
      
      if (!response.body) {
        throw new Error("No response body received");
      }
      
      // Save video to temporary file
      const videoBuffer = await response.arrayBuffer();
      await fs.writeFile(tempVideoPath, Buffer.from(videoBuffer));
      
      logger.log("Video downloaded, starting conversion...");
      
      // Convert video to GIF using FFmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempVideoPath)
          .outputOptions([
            '-t 5',                    // Duration: 5 seconds
            '-vf scale=256:256:force_original_aspect_ratio=increase,crop=256:256,fps=15', // Square 256x256, 15fps
            '-loop 0',                 // Loop forever
          ])
          .output(tempGifPath)
          .on('start', (commandLine) => {
            logger.log('FFmpeg process started:', { commandLine });
          })
          .on('progress', (progress) => {
            logger.log('Processing:', { 
              percent: progress.percent,
              timemark: progress.timemark 
            });
          })
          .on('end', () => {
            logger.log('FFmpeg processing completed');
            resolve();
          })
          .on('error', (err) => {
            logger.error('FFmpeg error:', err);
            reject(err);
          })
          .run();
      });
      
      // Read the generated GIF
      const gifBuffer = await fs.readFile(tempGifPath);
      const gifStats = await fs.stat(tempGifPath);
      
      logger.log("GIF created successfully", { 
        size: gifStats.size,
        sizeInMB: (gifStats.size / 1024 / 1024).toFixed(2) 
      });
      
      // Upload to Vercel Blob Storage
      const blobName = `gifs/${userId}/${sessionId}_${Date.now()}.gif`;
      const blob = await put(blobName, gifBuffer, {
        access: 'public',
        contentType: 'image/gif',
      });
      
      logger.log("GIF uploaded to storage", { url: blob.url });
      
      // Clean up temporary files
      await Promise.all([
        fs.unlink(tempVideoPath).catch(() => {}),
        fs.unlink(tempGifPath).catch(() => {}),
      ]);
      
      // Clean up the original video from storage if it's also in Vercel Blob
      if (videoUrl.includes('blob.vercel-storage.com')) {
        try {
          await del(videoUrl);
          logger.log("Original video deleted from storage");
        } catch (error) {
          logger.warn("Failed to delete original video", { error });
        }
      }
      
      return {
        gifUrl: blob.url,
        duration: 5,
        size: gifStats.size,
      };
      
    } catch (error) {
      // Clean up temporary files on error
      await Promise.all([
        fs.unlink(tempVideoPath).catch(() => {}),
        fs.unlink(tempGifPath).catch(() => {}),
      ]);
      
      logger.error("Video to GIF conversion failed", { error });
      throw error;
    }
  },
});