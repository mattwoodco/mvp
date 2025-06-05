const BUCKET = "storage";

export async function uploadBrowser(
  filename: string,
  file: File,
): Promise<string | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const key = `${filename}-${Date.now()}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("key", key);
    formData.append("bucket", BUCKET);

    const response = await fetch("/api/minio-upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result.url;
  } catch (error) {
    console.error("Minio browser upload failed:", error);
    return null;
  }
}
