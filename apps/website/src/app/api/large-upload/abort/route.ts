import { auth } from "@mvp/auth/server";
import { abortMultipartUpload } from "@mvp/storage/server";
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

    const { uploadId, key } = await request.json();

    if (!uploadId || !key) {
      return NextResponse.json(
        { error: "Missing uploadId or key" },
        { status: 400 },
      );
    }

    await abortMultipartUpload(uploadId, key);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Abort multipart upload failed:", error);
    return NextResponse.json(
      { error: "Failed to abort upload" },
      { status: 500 },
    );
  }
}
