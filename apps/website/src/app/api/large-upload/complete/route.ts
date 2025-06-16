import { auth } from "@mvp/auth/server";
import { completeMultipartUpload } from "@mvp/storage/server";
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

    const { uploadId, key, parts } = await request.json();

    if (!uploadId || !key || !parts || !Array.isArray(parts)) {
      return NextResponse.json(
        { error: "Missing uploadId, key, or parts array" },
        { status: 400 },
      );
    }

    if (parts.length === 0) {
      return NextResponse.json(
        { error: "Parts array cannot be empty" },
        { status: 400 },
      );
    }

    const validParts = parts.every(
      (part: any) =>
        typeof part.partNumber === "number" &&
        typeof part.etag === "string" &&
        part.partNumber >= 1 &&
        part.partNumber <= 10000 &&
        part.etag.length > 0,
    );

    if (!validParts) {
      return NextResponse.json(
        { error: "Invalid parts format" },
        { status: 400 },
      );
    }

    const sortedParts = parts.sort((a, b) => a.partNumber - b.partNumber);

    const url = await completeMultipartUpload(uploadId, key, sortedParts);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Complete multipart upload failed:", error);
    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 },
    );
  }
}
