"use client";

import { Badge } from "@mvp/ui/badge";
import { Button } from "@mvp/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@mvp/ui/card";
import { Input } from "@mvp/ui/input";
import { LargeFileUploader } from "@mvp/ui/large-file-uploader";
import { AlertCircle, CheckCircle, Loader2, Play, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createVideoAction, transcodeVideoAction } from "./actions";

interface VideoUploadFormProps {
  projectId: string;
  userId: string;
}

interface VideoState {
  id?: string;
  title: string;
  description: string;
  originalUrl?: string;
  transcodedUrl?: string;
  status: "idle" | "uploading" | "uploaded" | "transcoding" | "ready" | "error";
  error?: string;
  progress?: number;
}

export function VideoUploadForm({ projectId, userId }: VideoUploadFormProps) {
  const router = useRouter();
  const [video, setVideo] = useState<VideoState>({
    title: "",
    description: "",
    status: "idle",
  });

  const handleUploadComplete = async (url: string, file: File) => {
    try {
      setVideo((prev) => ({
        ...prev,
        originalUrl: url,
        status: "uploaded",
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));

      const newVideo = await createVideoAction({
        projectId,
        title: video.title || file.name.replace(/\.[^/.]+$/, ""),
        description: video.description,
        originalUrl: url,
        uploadedBy: userId,
      });

      if (newVideo) {
        setVideo((prev) => ({
          ...prev,
          id: newVideo.id,
          status: "transcoding",
        }));

        const transcodeResult = await transcodeVideoAction(newVideo.id, url);

        if (transcodeResult.success) {
          setVideo((prev) => ({
            ...prev,
            transcodedUrl: transcodeResult.transcodedUrl,
            status: "ready",
          }));
        } else {
          setVideo((prev) => ({
            ...prev,
            status: "error",
            error: transcodeResult.error,
          }));
        }
      }
    } catch (error) {
      setVideo((prev) => ({
        ...prev,
        status: "error",
        error: error instanceof Error ? error.message : "Upload failed",
      }));
    }
  };

  const handleUploadError = (error: string) => {
    setVideo((prev) => ({
      ...prev,
      status: "error",
      error,
    }));
  };

  const handleStartOver = () => {
    setVideo({
      title: "",
      description: "",
      status: "idle",
    });
  };

  const getStatusDisplay = () => {
    switch (video.status) {
      case "uploading":
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Uploading video...</span>
          </div>
        );
      case "uploaded":
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Upload complete</span>
          </div>
        );
      case "transcoding":
        return (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing video for optimal playback...</span>
          </div>
        );
      case "ready":
        return (
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Video ready!</span>
          </div>
        );
      case "error":
        return (
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span>Error: {video.error}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <Input
              id="title"
              value={video.title}
              onChange={(e) =>
                setVideo((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="Enter video title"
              disabled={video.status !== "idle"}
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium mb-1"
            >
              Description (optional)
            </label>
            <Input
              id="description"
              value={video.description}
              onChange={(e) =>
                setVideo((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Enter video description"
              disabled={video.status !== "idle"}
            />
          </div>
        </CardContent>
      </Card>

      {video.status === "idle" && (
        <LargeFileUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          allowedTypes={["video/mp4", "video/webm", "video/quicktime"]}
          maxFileSize={2 * 1024 * 1024 * 1024} // 2GB
        />
      )}

      {video.status !== "idle" && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Upload Status</CardTitle>
              <Badge
                variant={video.status === "error" ? "destructive" : "default"}
              >
                {video.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getStatusDisplay()}

              {video.status === "error" && (
                <div className="flex gap-2">
                  <Button onClick={handleStartOver} variant="outline">
                    Start Over
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {video.transcodedUrl && video.status === "ready" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Video Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video
                src={video.transcodedUrl}
                controls
                className="w-full h-full"
                preload="metadata"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div>
                <h3 className="font-semibold">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-muted-foreground">
                    {video.description}
                  </p>
                )}
              </div>
              <Button onClick={() => router.push(`/projects/${projectId}`)}>
                Back to Project
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
