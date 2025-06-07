declare const window: Window & typeof globalThis;

const BUCKET = "storage";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

interface MinioResponse {
  url: string;
}

export async function uploadBrowser(
  filename: string,
  file: File,
): Promise<string | null> {
  if (!isBrowser()) {
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

    const result = (await response.json()) as MinioResponse;
    return result.url;
  } catch (error) {
    console.error("Minio browser upload failed:", error);
    return null;
  }
}
