import { user } from "@mvp/database";
import { db } from "@mvp/database/server";
import { upload } from "@mvp/storage";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "./server";

export async function uploadAvatar(file: File) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const imageUrl = await upload(`avatars/${session.user.id}`, file);
  if (!imageUrl) throw new Error("Failed to upload avatar");

  await db
    .update(user)
    .set({
      image: imageUrl,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id));

  await auth.api.updateSession({
    headers: await headers(),
    data: {
      user: {
        ...session.user,
        image: imageUrl,
      },
    },
  });

  return imageUrl;
}
