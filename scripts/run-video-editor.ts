#!/usr/bin/env bun

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoEditorPath = path.join(__dirname, "..", "apps", "video-editor");

console.log("🎬 Starting Video Editor Service...");
console.log("📁 Service location:", videoEditorPath);

// Check if ffmpeg is installed
try {
  const ffmpegCheck = spawn("ffmpeg", ["-version"]);
  ffmpegCheck.on("close", (code) => {
    if (code !== 0) {
      console.error("❌ FFmpeg not found! Please install ffmpeg:");
      console.error("   macOS: brew install ffmpeg");
      console.error("   Ubuntu: sudo apt install ffmpeg");
      process.exit(1);
    }
  });
} catch (error) {
  console.error("❌ FFmpeg not found! Please install ffmpeg first.");
  process.exit(1);
}

// Load .env.local file
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

// Start the video editor service with environment variables
const videoEditor = spawn("bun", ["dev"], {
  cwd: videoEditorPath,
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV || "local",
    NEXT_PUBLIC_USE_MINIO: process.env.NEXT_PUBLIC_USE_MINIO || "true",
  },
});

videoEditor.on("close", (code) => {
  console.log(`🎬 Video Editor service exited with code ${code}`);
});

videoEditor.on("error", (error) => {
  console.error("❌ Failed to start video editor service:", error);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down video editor service...");
  videoEditor.kill("SIGINT");
});
