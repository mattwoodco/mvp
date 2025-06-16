import { auth } from "@mvp/auth/server";
import { uploadChunk } from "@mvp/storage/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const uploadId = formData.get("uploadId") as string;
    const key = formData.get("key") as string;
    const partNumber = Number.parseInt(formData.get("partNumber") as string);
    const chunk = formData.get("chunk") as File;

    if (!uploadId || !key || !partNumber || !chunk) {
      return NextResponse.json(
        { error: "Missing uploadId, key, partNumber, or chunk" },
        { status: 400 },
      );
    }

    if (partNumber < 1 || partNumber > 10000) {
      return NextResponse.json(
        { error: "Part number must be between 1 and 10000" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await chunk.arrayBuffer());

    // Validate chunk size (minimum 5MB except for single part uploads or the last part)
    const minSize = 5 * 1024 * 1024; // 5MB
    if (buffer.length < minSize) {
      // Allow small chunks only if it's a single part upload or we're told it's the last part
      const isLastPart = formData.get("isLastPart") === "true";
      if (!isLastPart && partNumber !== 1) {
        return NextResponse.json(
          { error: "Chunk size must be at least 5MB except for the last part" },
          { status: 400 },
        );
      }
    }

    const result = await uploadChunk(uploadId, key, partNumber, buffer);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Chunk upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload chunk" },
      { status: 500 },
    );
  }
}
