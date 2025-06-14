"use server";

import { auth } from "@money/auth/server";
import { user } from "@money/database";
import { db } from "@money/database/server";
import { upload } from "@money/storage";
import { eq } from "drizzle-orm";

export async function uploadAvatar(file: File) {
  const session = await auth.api.getSession({
    headers: new Headers(),
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

  await auth.api.updateUser({
    body: {
      image: imageUrl,
    },
  });

  return imageUrl;
}
