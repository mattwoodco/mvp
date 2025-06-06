"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { useRun } from "@trigger.dev/react";
import { Button } from "@mvp/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@mvp/ui/card";
import { Progress } from "@mvp/ui/progress";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, XCircle, Video, FileGif } from "lucide-react";

export default function VideoToGifPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [runId, setRunId] = useState<string | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);

  // Use Trigger.dev React hook to track run status
  const run = useRun(runId ?? "", {
    enabled: !!runId,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }
      // Validate file size (max 100MB)
      if (selectedFile.size > 100 * 1024 * 1024) {
        toast.error("Video file must be less than 100MB");
        return;
      }
      setFile(selectedFile);
      setGifUrl(null); // Reset previous result
      setRunId(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      // Upload video to Vercel Blob Storage
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/video-to-gif/upload",
      });

      // Trigger the conversion task
      const response = await fetch("/api/video-to-gif/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: blob.url,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start conversion");
      }

      const data = await response.json();
      setRunId(data.runId);
      toast.success("Video uploaded! Conversion started...");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  // Update UI based on run status
  if (run?.output?.gifUrl && !gifUrl) {
    setGifUrl(run.output.gifUrl);
    toast.success("GIF created successfully!");
  }

  const getStatusMessage = () => {
    if (!run) return null;
    
    switch (run.status) {
      case "PENDING":
      case "QUEUED":
        return "Waiting in queue...";
      case "EXECUTING":
        return "Converting video to GIF...";
      case "COMPLETED":
        return "Conversion completed!";
      case "FAILED":
        return "Conversion failed";
      case "CRASHED":
        return "Task crashed";
      case "CANCELED":
        return "Conversion canceled";
      default:
        return "Processing...";
    }
  };

  const getProgressPercentage = () => {
    if (!run) return 0;
    
    switch (run.status) {
      case "PENDING":
      case "QUEUED":
        return 10;
      case "EXECUTING":
        return 50;
      case "COMPLETED":
        return 100;
      default:
        return 0;
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Video to GIF Converter</CardTitle>
          <CardDescription>
            Convert your video to a 5-second, 256x256 animated GIF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
                id="video-upload"
                disabled={uploading || !!runId}
              />
              <label
                htmlFor="video-upload"
                className="cursor-pointer space-y-2"
              >
                <Video className="mx-auto h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-600">
                  {file ? file.name : "Click to select a video file"}
                </p>
                <p className="text-xs text-gray-500">
                  Maximum file size: 100MB
                </p>
              </label>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!file || uploading || !!runId}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Convert
                </>
              )}
            </Button>
          </div>

          {/* Progress Section */}
          {runId && run && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {getStatusMessage()}
                </span>
                <span className="text-sm text-gray-500">
                  {getProgressPercentage()}%
                </span>
              </div>
              
              <Progress value={getProgressPercentage()} className="w-full" />
              
              {run.status === "EXECUTING" && (
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-600">
                    Processing your video...
                  </span>
                </div>
              )}
              
              {run.status === "COMPLETED" && (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">
                    Successfully converted to GIF!
                  </span>
                </div>
              )}
              
              {(run.status === "FAILED" || run.status === "CRASHED") && (
                <div className="flex items-center space-x-2 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="text-sm">
                    {run.error?.message || "Conversion failed"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Result Section */}
          {gifUrl && (
            <div className="space-y-4">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-center mb-4">
                  <FileGif className="h-8 w-8 text-gray-600" />
                </div>
                <img
                  src={gifUrl}
                  alt="Generated GIF"
                  className="mx-auto rounded-lg shadow-md"
                  style={{ width: "256px", height: "256px" }}
                />
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(gifUrl, "_blank")}
                  >
                    Open in New Tab
                  </Button>
                  <Button
                    variant="default"
                    className="w-full"
                    onClick={() => {
                      setFile(null);
                      setRunId(null);
                      setGifUrl(null);
                      toast.success("Ready for a new video!");
                    }}
                  >
                    Convert Another Video
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}