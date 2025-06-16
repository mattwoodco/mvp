#!/usr/bin/env bun

import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const transcorderPath = path.join(__dirname, "..", "apps", "transcoder");

console.log("🎬 Starting FFmpeg Transcoder Service...");
console.log("📁 Service location:", transcorderPath);

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

// Start the transcoder service
const transcoder = spawn("bun", ["dev"], {
  cwd: transcorderPath,
  stdio: "inherit",
  env: { ...process.env },
});

transcoder.on("close", (code) => {
  console.log(`🎬 Transcoder service exited with code ${code}`);
});

transcoder.on("error", (error) => {
  console.error("❌ Failed to start transcoder service:", error);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down transcoder service...");
  transcoder.kill("SIGINT");
});
