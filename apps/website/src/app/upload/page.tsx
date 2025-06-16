"use client";

import { LargeFileUploader } from "@mvp/ui/large-file-uploader";
import { useState } from "react";

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<
    { name: string; url: string }[]
  >([]);

  const handleUploadComplete = (url: string, file: File) => {
    setUploadedFiles((prev) => [...prev, { name: file.name, url }]);
  };

  const handleUploadError = (error: string, file: File) => {
    console.error(`Upload failed for ${file.name}:`, error);
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Large File Upload</h1>
        <p className="text-muted-foreground mb-8">
          Upload large files with chunked multipart uploads, progress tracking,
          and resumable transfers. Maximum file size: 2GB.
        </p>

        <LargeFileUploader
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          maxFileSize={2 * 1024 * 1024 * 1024} // 2GB
          chunkSize={10 * 1024 * 1024} // 10MB chunks
        />

        {uploadedFiles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={`${file.name}-${file.url}`}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <span className="font-medium">{file.name}</span>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View File
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
