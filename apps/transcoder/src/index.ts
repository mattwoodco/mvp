import { putServer } from "@mvp/storage/server";
import { Hono } from "hono";
import { spawn } from "node:child_process";
import { createWriteStream, promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { z } from "zod";

const app = new Hono();

const TranscodeSchema = z.object({
  fileId: z.string().min(1),
  fileUrl: z.string().url(),
});

type TranscodeRequest = z.infer<typeof TranscodeSchema>;

app.get("/", (c) => {
  return c.json({
    service: "FFmpeg Video Transcoder",
    version: "1.0.0",
    status: "running",
  });
});

app.post("/transcode", async (c) => {
  try {
    const body = await c.req.json();
    console.log("🎬 Received transcode request:", { fileId: body.fileId });

    const { fileId, fileUrl } = TranscodeSchema.parse(body);

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "transcoder-"));
    const inputPath = path.join(tempDir, `input-${fileId}`);
    const outputPath = path.join(tempDir, `output-${fileId}.mp4`);

    try {
      console.log("📥 Downloading file from:", fileUrl);
      await downloadFile(fileUrl, inputPath);

      console.log("🔍 Analyzing input file...");
      await analyzeInputFile(inputPath);

      console.log("🔄 Starting transcoding...");
      await transcodeVideo(inputPath, outputPath);

      console.log("✅ Validating output file...");
      await validateOutputFile(outputPath);

      console.log("📤 Uploading optimized file...");
      const outputUrl = await uploadTranscodedFile(outputPath, fileId);

      console.log("✅ Transcoding completed!");
      console.log("🎥 Playable link:", outputUrl);

      return c.json({
        success: true,
        originalFile: fileUrl,
        optimizedFile: outputUrl,
        fileId: fileId,
        message: "Video successfully optimized for web delivery",
      });
    } finally {
      // Cleanup temp files
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  } catch (error) {
    console.error("❌ Transcoding failed:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  if (!response.body) {
    throw new Error("No response body");
  }

  const fileStream = createWriteStream(outputPath);
  await pipeline(response.body as any, fileStream);

  // Log downloaded file info
  const stats = await fs.stat(outputPath);
  console.log("📁 Downloaded file size:", stats.size, "bytes");
}

async function analyzeInputFile(inputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("🔍 Running ffprobe on input file...");

    const ffprobe = spawn("ffprobe", [
      "-v",
      "quiet",
      "-print_format",
      "json",
      "-show_format",
      "-show_streams",
      inputPath,
    ]);

    let stdout = "";
    let stderr = "";

    ffprobe.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    ffprobe.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    ffprobe.on("close", (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(stdout);
          console.log("📊 Input file format:", info.format?.format_name);
          console.log("⏱️  Input duration:", `${info.format?.duration}s`);
          console.log("📏 Input size:", `${info.format?.size} bytes`);

          if (info.streams) {
            info.streams.forEach((stream: any, index: number) => {
              if (stream.codec_type === "video") {
                console.log(
                  `🎥 Video stream ${index}:`,
                  stream.codec_name,
                  `${stream.width}x${stream.height}`,
                );
              } else if (stream.codec_type === "audio") {
                console.log(
                  `🔊 Audio stream ${index}:`,
                  stream.codec_name,
                  `${stream.sample_rate}Hz`,
                );
              }
            });
          }
          resolve();
        } catch (error) {
          console.error("❌ Failed to parse ffprobe output:", error);
          console.log("Raw ffprobe output:", stdout);
          resolve(); // Don't fail the whole process
        }
      } else {
        console.error("❌ ffprobe failed with code:", code);
        console.error("❌ ffprobe stderr:", stderr);
        resolve(); // Don't fail the whole process
      }
    });

    ffprobe.on("error", (error) => {
      console.error("❌ ffprobe spawn error:", error);
      resolve(); // Don't fail the whole process
    });
  });
}

async function validateOutputFile(outputPath: string): Promise<void> {
  try {
    const stats = await fs.stat(outputPath);
    console.log("📁 Output file size:", stats.size, "bytes");

    if (stats.size === 0) {
      throw new Error("Output file is empty!");
    }

    // Quick ffprobe validation
    return new Promise((resolve, reject) => {
      const ffprobe = spawn("ffprobe", [
        "-v",
        "error",
        "-select_streams",
        "v:0",
        "-count_packets",
        "-show_entries",
        "stream=nb_read_packets",
        "-of",
        "csv=p=0",
        outputPath,
      ]);

      let stdout = "";
      let stderr = "";

      ffprobe.stdout.on("data", (data) => {
        stdout += data.toString();
      });

      ffprobe.stderr.on("data", (data) => {
        stderr += data.toString();
      });

      ffprobe.on("close", (code) => {
        if (code === 0) {
          const packetCount = Number.parseInt(stdout.trim());
          console.log("📦 Output video packets:", packetCount);

          if (packetCount > 0) {
            console.log("✅ Output file appears valid");
            resolve();
          } else {
            console.error("❌ Output file has no video packets");
            reject(new Error("Output file contains no video data"));
          }
        } else {
          console.error("❌ Output validation failed:", stderr);
          reject(new Error("Output file validation failed"));
        }
      });

      ffprobe.on("error", (error) => {
        console.error("❌ Output validation error:", error);
        reject(error);
      });
    });
  } catch (error) {
    console.error("❌ Output file validation failed:", error);
    throw error;
  }
}

async function transcodeVideo(
  inputPath: string,
  outputPath: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Optimized ffmpeg command for web delivery
    // Based on research: H.264, fast start, good compression
    const ffmpegArgs = [
      "-i",
      inputPath,
      "-c:v",
      "libx264", // H.264 codec for compatibility
      "-preset",
      "medium", // Balance between speed and compression
      "-crf",
      "23", // Constant Rate Factor for quality
      "-profile:v",
      "main", // Use main profile for better compatibility
      "-level",
      "4.0", // H.264 level for wide compatibility
      "-pix_fmt",
      "yuv420p", // Force 8-bit output for compatibility
      "-colorspace",
      "bt709", // Convert to standard color space
      "-color_primaries",
      "bt709", // Standard primaries
      "-color_trc",
      "bt709", // Standard transfer characteristics
      "-movflags",
      "+faststart", // Enable fast start for web streaming
      "-c:a",
      "aac", // AAC audio codec
      "-b:a",
      "128k", // Audio bitrate
      "-vf",
      "scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p", // Ensure even dimensions and force 8-bit
      "-max_muxing_queue_size",
      "9999",
      "-y", // Overwrite output file
      outputPath,
    ];

    console.log("🔧 FFmpeg command:", "ffmpeg", ffmpegArgs.join(" "));

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    let stderr = "";

    ffmpeg.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;

      // Log progress (ffmpeg outputs to stderr)
      const progressMatch = output.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (progressMatch) {
        console.log("⏳ Progress:", progressMatch[1]);
      }

      // Log important messages
      if (output.includes("Invalid data found")) {
        console.warn("⚠️  FFmpeg warning: Invalid data found in input");
      }
      if (output.includes("Non-monotonous DTS")) {
        console.warn("⚠️  FFmpeg warning: Non-monotonous DTS in input");
      }
      if (output.includes("Error")) {
        console.error("⚠️  FFmpeg error output:", output.trim());
      }
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log("✅ FFmpeg transcoding completed");

        // Log a sample of stderr for debugging even on success
        if (stderr) {
          const stderrLines = stderr.split("\n").filter((line) => line.trim());
          console.log("📋 FFmpeg completion info (last few lines):");
          for (const line of stderrLines.slice(-5)) {
            console.log("  ", line);
          }
        }

        resolve();
      } else {
        console.error("❌ FFmpeg failed with code:", code);
        console.error("❌ FFmpeg full stderr output:");
        console.error(stderr);
        reject(new Error(`FFmpeg failed with exit code ${code}`));
      }
    });

    ffmpeg.on("error", (error) => {
      console.error("❌ FFmpeg spawn error:", error);
      reject(error);
    });
  });
}

async function uploadTranscodedFile(
  filePath: string,
  originalFileId: string,
): Promise<string | null> {
  const fileBuffer = await fs.readFile(filePath);
  const optimizedFileName = `optimized-${originalFileId}.mp4`;

  console.log(
    "📤 Uploading file:",
    optimizedFileName,
    "Size:",
    fileBuffer.length,
    "bytes",
  );

  return await putServer(optimizedFileName, fileBuffer);
}

const port = process.env.PORT || 8080;
console.log(`🎬 FFmpeg Transcoder Service starting on port ${port}`);
console.log("🔧 Make sure ffmpeg is installed on your system");

export default {
  port,
  fetch: app.fetch,
};
