"use client";

import { upload } from "@mvp/storage";
import { Button } from "@mvp/ui/button";
import Image from "next/image";
import { useState } from "react";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadedFileType, setUploadedFileType] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const url = await upload(file.name, file);
      setUploadedUrl(url);
      setUploadedFileType(file.type);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Upload File
      </h3>

      <div className="space-y-4">
        <div>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {file && (
          <div className="text-sm text-muted-foreground">
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
        >
          {uploading ? "Uploading..." : "Upload File"}
        </Button>

        {uploadedUrl && (
          <div className="p-3 bg-primary/5 rounded border border-primary/20">
            <p className="text-sm text-primary font-medium">
              Upload successful!
            </p>
            {uploadedFileType?.startsWith("image/") ? (
              <div className="mt-2">
                <div className="relative w-full max-w-md">
                  <Image
                    src={uploadedUrl}
                    alt="Uploaded file"
                    width={400}
                    height={300}
                    className="max-w-full h-auto max-h-64 rounded border border-border object-contain"
                    unoptimized
                  />
                </div>
                <a
                  href={uploadedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-sm text-primary hover:underline break-all"
                >
                  {uploadedUrl}
                </a>
              </div>
            ) : (
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {uploadedUrl}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
