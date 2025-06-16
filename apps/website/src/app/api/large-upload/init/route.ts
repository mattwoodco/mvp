import { auth } from "@mvp/auth/server";
import { initializeMultipartUpload } from "@mvp/storage/server";
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

    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: "Missing filename or contentType" },
        { status: 400 },
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "application/pdf",
    ];

    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 },
      );
    }

    const result = await initializeMultipartUpload(filename, contentType);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Initialize multipart upload failed:", error);
    return NextResponse.json(
      { error: "Failed to initialize upload" },
      { status: 500 },
    );
  }
}
