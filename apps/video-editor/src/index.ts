import { spawn } from "node:child_process";
import { promises as fs, createWriteStream } from "node:fs";
import os from "node:os";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { putServer } from "@mvp/storage/server";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono();

interface ChyronPosition {
  x: number;
  y: number;
  anchor?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
}

interface ChyronStyle {
  fontFamily?: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  borderColor?: string;
  borderWidth?: number;
  padding?: number;
  borderRadius?: number;
  shadowColor?: string;
  shadowOffset?: { x: number; y: number };
  shadowBlur?: number;
}

interface ChyronTiming {
  startTime: number;
  duration: number;
}

const ChyronConfigSchema = z.object({
  text: z.string().min(1),
  position: z.object({
    x: z.number().min(0),
    y: z.number().min(0),
    anchor: z
      .enum([
        "top-left",
        "top-center",
        "top-right",
        "center-left",
        "center",
        "center-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ])
      .optional()
      .default("bottom-center"),
  }),
  style: z
    .object({
      fontFamily: z.string().optional().default("Arial"),
      fontSize: z.number().min(8).max(200).optional().default(24),
      fontColor: z.string().optional().default("white"),
      backgroundColor: z.string().optional().default("black"),
      backgroundOpacity: z.number().min(0).max(1).optional().default(0.7),
      borderColor: z.string().optional(),
      borderWidth: z.number().min(0).optional().default(0),
      padding: z.number().min(0).optional().default(10),
      borderRadius: z.number().min(0).optional().default(0),
      shadowColor: z.string().optional(),
      shadowOffset: z
        .object({
          x: z.number(),
          y: z.number(),
        })
        .optional(),
      shadowBlur: z.number().min(0).optional(),
    })
    .optional()
    .default({}),
  timing: z.object({
    startTime: z.number().min(0),
    duration: z.number().min(0.1),
  }),
});

const VideoEditRequestSchema = z.object({
  videoUrl: z.string().url(),
  chyron: ChyronConfigSchema,
});

type VideoEditRequest = z.infer<typeof VideoEditRequestSchema>;

const EXAMPLE_CONFIGS = {
  newsChyron: {
    text: "BREAKING NEWS",
    position: { x: 50, y: 90, anchor: "bottom-center" as const },
    style: {
      fontFamily: "Arial",
      fontSize: 32,
      fontColor: "white",
      backgroundColor: "red",
      backgroundOpacity: 0.9,
      padding: 15,
      borderRadius: 5,
    },
    timing: { startTime: 0, duration: 5 },
  },
  socialMediaTag: {
    text: "@username",
    position: { x: 10, y: 10, anchor: "top-left" as const },
    style: {
      fontFamily: "Helvetica",
      fontSize: 18,
      fontColor: "white",
      backgroundColor: "rgba(0,0,0,0.5)",
      backgroundOpacity: 0.7,
      padding: 8,
      borderRadius: 12,
    },
    timing: { startTime: 0, duration: 10 },
  },
  titleCard: {
    text: "Video Title Here",
    position: { x: 50, y: 50, anchor: "center" as const },
    style: {
      fontFamily: "Arial",
      fontSize: 48,
      fontColor: "yellow",
      backgroundColor: "black",
      backgroundOpacity: 0.8,
      borderColor: "yellow",
      borderWidth: 2,
      padding: 20,
      borderRadius: 10,
    },
    timing: { startTime: 1, duration: 3 },
  },
};

app.get("/", (c) => {
  return c.json({
    service: "FFmpeg Video Editor",
    version: "1.0.0",
    status: "running",
    examples: EXAMPLE_CONFIGS,
  });
});

app.get("/examples", (c) => {
  return c.json({
    configs: EXAMPLE_CONFIGS,
    usage: "POST /edit with { videoUrl: string, chyron: ChyronConfig }",
  });
});

app.post("/edit", async (c) => {
  try {
    const body = await c.req.json();
    console.log("🎬 Received video edit request");

    const { videoUrl, chyron } = VideoEditRequestSchema.parse(body);

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "video-editor-"));
    const inputPath = path.join(tempDir, "input.mp4");
    const outputPath = path.join(tempDir, "output.mp4");

    try {
      console.log("📥 Downloading video from:", videoUrl);
      await downloadFile(videoUrl, inputPath);

      console.log("🔍 Analyzing input video...");
      const videoInfo = await analyzeVideo(inputPath);

      console.log("✏️ Adding chyron overlay...");
      await addChyronOverlay(inputPath, outputPath, chyron, videoInfo);

      console.log("✅ Validating output video...");
      await validateOutput(outputPath);

      console.log("📤 Uploading edited video...");
      const outputUrl = await uploadEditedVideo(outputPath);

      console.log("✅ Video editing completed!");

      return c.json({
        success: true,
        originalVideo: videoUrl,
        editedVideo: outputUrl,
        chyronConfig: chyron,
        message: "Video successfully edited with chyron overlay",
      });
    } finally {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  } catch (error) {
    console.error("❌ Video editing failed:", error);
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

  const stats = await fs.stat(outputPath);
  console.log("📁 Downloaded file size:", stats.size, "bytes");
}

interface VideoInfo {
  width: number;
  height: number;
  duration: number;
  fps: number;
}

function parseFrameRate(frameRateStr: string): number {
  if (!frameRateStr || frameRateStr === "0/0") return 30;

  const parts = frameRateStr.split("/");
  if (parts.length !== 2) return 30;

  const numeratorStr = parts[0];
  const denominatorStr = parts[1];

  if (!numeratorStr || !denominatorStr) return 30;

  const numerator = Number.parseFloat(numeratorStr);
  const denominator = Number.parseFloat(denominatorStr);

  if (denominator === 0 || Number.isNaN(numerator) || Number.isNaN(denominator))
    return 30;

  return numerator / denominator;
}

async function analyzeVideo(inputPath: string): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
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
          const videoStream = info.streams.find(
            (s: any) => s.codec_type === "video",
          );

          if (!videoStream) {
            throw new Error("No video stream found");
          }

          const videoInfo: VideoInfo = {
            width: videoStream.width,
            height: videoStream.height,
            duration: Number.parseFloat(info.format.duration),
            fps: parseFrameRate(videoStream.r_frame_rate) || 30,
          };

          console.log("📊 Video info:", videoInfo);
          resolve(videoInfo);
        } catch (error) {
          reject(new Error(`Failed to parse video info: ${error}`));
        }
      } else {
        reject(new Error(`ffprobe failed: ${stderr}`));
      }
    });
  });
}

function buildChyronFilter(
  chyron: z.infer<typeof ChyronConfigSchema>,
  videoInfo: VideoInfo,
): string {
  const { text, position, style, timing } = chyron;

  let x = position.x;
  let y = position.y;

  if (position.anchor) {
    switch (position.anchor) {
      case "top-center":
        x = videoInfo.width / 2 - (text.length * (style.fontSize || 24)) / 4;
        y = position.y;
        break;
      case "top-right":
        x = videoInfo.width - position.x;
        y = position.y;
        break;
      case "center-left":
        x = position.x;
        y = videoInfo.height / 2 + (style.fontSize || 24) / 2;
        break;
      case "center":
        x = videoInfo.width / 2 - (text.length * (style.fontSize || 24)) / 4;
        y = videoInfo.height / 2 + (style.fontSize || 24) / 2;
        break;
      case "center-right":
        x = videoInfo.width - position.x;
        y = videoInfo.height / 2 + (style.fontSize || 24) / 2;
        break;
      case "bottom-left":
        x = position.x;
        y = videoInfo.height - position.y;
        break;
      case "bottom-center":
        x = videoInfo.width / 2 - (text.length * (style.fontSize || 24)) / 4;
        y = videoInfo.height - position.y;
        break;
      case "bottom-right":
        x = videoInfo.width - position.x;
        y = videoInfo.height - position.y;
        break;
    }
  }

  const backgroundColor = style.backgroundColor || "black";
  const backgroundOpacity = style.backgroundOpacity || 0.7;
  // Convert opacity (0-1) to hex (00-FF)
  const opacityHex = Math.round(backgroundOpacity * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  const boxColor = `${backgroundColor}@0x${opacityHex}`;

  // Escape text for FFmpeg
  const escapedText = text.replace(/'/g, "\\'").replace(/:/g, "\\:");

  let drawTextFilter = `drawtext=text='${escapedText}':x=${x}:y=${y}`;
  // Use default font instead of specifying fontfile
  drawTextFilter += `:fontsize=${style.fontSize || 24}`;
  drawTextFilter += `:fontcolor=${style.fontColor || "white"}`;
  drawTextFilter += `:box=1:boxcolor=${boxColor}`;
  drawTextFilter += `:boxborderw=${style.padding || 10}`;

  if (style.borderWidth && style.borderColor) {
    drawTextFilter += `:borderw=${style.borderWidth}:bordercolor=${style.borderColor}`;
  }

  drawTextFilter += `:enable='between(t,${timing.startTime},${timing.startTime + timing.duration})'`;

  return drawTextFilter;
}

async function addChyronOverlay(
  inputPath: string,
  outputPath: string,
  chyron: z.infer<typeof ChyronConfigSchema>,
  videoInfo: VideoInfo,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const chyronFilter = buildChyronFilter(chyron, videoInfo);

    const videoFilters = [
      chyronFilter,
      "scale=trunc(iw/2)*2:trunc(ih/2)*2",
      "format=yuv420p",
    ].join(",");

    const ffmpegArgs = [
      "-i",
      inputPath,
      "-vf",
      videoFilters,
      "-c:v",
      "libx264",
      "-preset",
      "medium",
      "-crf",
      "23",
      "-profile:v",
      "main",
      "-level",
      "4.0",
      "-pix_fmt",
      "yuv420p",
      "-colorspace",
      "bt709",
      "-color_primaries",
      "bt709",
      "-color_trc",
      "bt709",
      "-movflags",
      "+faststart",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-max_muxing_queue_size",
      "9999",
      "-y",
      outputPath,
    ];

    console.log("🔧 FFmpeg command:", "ffmpeg", ffmpegArgs.join(" "));

    const ffmpeg = spawn("ffmpeg", ffmpegArgs);

    let stderr = "";

    ffmpeg.stderr.on("data", (data) => {
      const output = data.toString();
      stderr += output;

      // Log all FFmpeg output for debugging
      console.log("FFmpeg:", output.trim());

      const progressMatch = output.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/);
      if (progressMatch) {
        console.log("⏳ Progress:", progressMatch[1]);
      }
    });

    ffmpeg.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Chyron overlay added successfully");
        resolve();
      } else {
        console.error("❌ FFmpeg failed with exit code:", code);
        console.error("❌ Full FFmpeg stderr output:");
        console.error(stderr);
        reject(
          new Error(
            `FFmpeg failed with exit code ${code}. Check logs for details.`,
          ),
        );
      }
    });

    ffmpeg.on("error", (error) => {
      console.error("❌ FFmpeg spawn error:", error);
      reject(error);
    });
  });
}

async function validateOutput(outputPath: string): Promise<void> {
  const stats = await fs.stat(outputPath);
  console.log("📁 Output file size:", stats.size, "bytes");

  if (stats.size === 0) {
    throw new Error("Output file is empty!");
  }
}

async function uploadEditedVideo(filePath: string): Promise<string | null> {
  const fileBuffer = await fs.readFile(filePath);
  const fileName = `edited-${Date.now()}.mp4`;

  console.log(
    "📤 Uploading file:",
    fileName,
    "Size:",
    fileBuffer.length,
    "bytes",
  );

  return await putServer(fileName, fileBuffer);
}

const port = process.env.PORT || 8081;
console.log(`🎬 Video Editor Service starting on port ${port}`);
console.log("🔧 Make sure ffmpeg is installed on your system");

export default {
  port,
  fetch: app.fetch,
};
