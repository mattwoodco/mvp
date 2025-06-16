"use client";

import { uploadLargeFile } from "@mvp/storage";
import { CheckCircle, Upload, X, XCircle } from "lucide-react";
import { useCallback, useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Progress } from "./progress";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  url?: string;
  error?: string;
  abortController?: AbortController;
}

interface LargeFileUploaderProps {
  onUploadComplete?: (url: string, file: File) => void;
  onUploadError?: (error: string, file: File) => void;
  maxFileSize?: number;
  allowedTypes?: string[];
  chunkSize?: number;
  maxConcurrentChunks?: number;
}

export function LargeFileUploader({
  onUploadComplete,
  onUploadError,
  maxFileSize = 500 * 1024 * 1024, // 500MB default
  allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "application/pdf",
  ],
  chunkSize = 10 * 1024 * 1024, // 10MB chunks
  maxConcurrentChunks = 5, // 3 parallel uploads default
}: LargeFileUploaderProps) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    },
    [allowedTypes, maxFileSize],
  );

  const handleFiles = useCallback(
    (files: File[]) => {
      const validFiles = files.filter((file) => {
        if (file.size > maxFileSize) {
          onUploadError?.(
            `File ${file.name} is too large. Maximum size is ${Math.round(maxFileSize / 1024 / 1024)}MB`,
            file,
          );
          return false;
        }
        if (!allowedTypes.includes(file.type)) {
          onUploadError?.(`File type ${file.type} is not supported`, file);
          return false;
        }
        return true;
      });

      const newUploads: UploadFile[] = validFiles.map((file) => ({
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: "pending",
      }));

      setUploads((prev) => [...prev, ...newUploads]);

      // Start uploads
      for (const upload of newUploads) {
        startUpload(upload);
      }
    },
    [allowedTypes, maxFileSize, onUploadError, chunkSize, maxConcurrentChunks],
  );

  const startUpload = useCallback(
    async (uploadFile: UploadFile) => {
      const abortController = new AbortController();

      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadFile.id
            ? { ...u, status: "uploading", abortController }
            : u,
        ),
      );

      try {
        const url = await uploadLargeFile(
          uploadFile.file.name,
          uploadFile.file,
          {
            chunkSize,
            maxConcurrentChunks,
            abortSignal: abortController.signal,
            onProgress: (progress) => {
              setUploads((prev) =>
                prev.map((u) =>
                  u.id === uploadFile.id
                    ? { ...u, progress: progress.percentage }
                    : u,
                ),
              );
            },
          },
        );

        if (url) {
          setUploads((prev) =>
            prev.map((u) =>
              u.id === uploadFile.id
                ? { ...u, status: "completed", url, progress: 100 }
                : u,
            ),
          );
          onUploadComplete?.(url, uploadFile.file);
        } else {
          throw new Error("Upload failed - no URL returned");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadFile.id
              ? { ...u, status: "error", error: errorMessage }
              : u,
          ),
        );
        onUploadError?.(errorMessage, uploadFile.file);
      }
    },
    [chunkSize, maxConcurrentChunks, onUploadComplete, onUploadError],
  );

  const cancelUpload = useCallback((uploadId: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === uploadId);
      if (upload?.abortController) {
        upload.abortController.abort();
      }
      return prev.filter((u) => u.id !== uploadId);
    });
  }, []);

  const clearCompleted = useCallback(() => {
    setUploads((prev) => prev.filter((u) => u.status !== "completed"));
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Large File Upload</span>
          {uploads.some((u) => u.status === "completed") && (
            <Button variant="outline" size="sm" onClick={clearCompleted}>
              Clear Completed
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Maximum file size: {Math.round(maxFileSize / 1024 / 1024)}MB
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: Images, Videos, PDFs
            </p>
          </div>
          <input
            type="file"
            multiple
            accept={allowedTypes.join(",")}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => {
              if (e.target.files) {
                handleFiles(Array.from(e.target.files));
                e.target.value = "";
              }
            }}
          />
        </div>

        {/* Upload List */}
        {uploads.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium">Uploads</h3>
            {uploads.map((upload) => (
              <div
                key={upload.id}
                className="flex items-center space-x-3 p-3 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium truncate">
                      {upload.file.name}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(upload.file.size)}
                      </span>
                      {upload.status === "uploading" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelUpload(upload.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {upload.status === "uploading" && (
                    <div className="space-y-1">
                      <Progress value={upload.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {upload.progress}% uploaded
                      </p>
                    </div>
                  )}

                  {upload.status === "error" && (
                    <p className="text-sm text-destructive">{upload.error}</p>
                  )}

                  {upload.status === "completed" && upload.url && (
                    <p className="text-sm text-green-600">
                      Upload completed successfully
                    </p>
                  )}
                </div>

                <div className="flex-shrink-0">
                  {upload.status === "completed" && (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  )}
                  {upload.status === "error" && (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                  {upload.status === "uploading" && (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
