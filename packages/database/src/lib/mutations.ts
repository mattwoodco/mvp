import { eq } from "drizzle-orm";
import { db } from "../client";
import { user } from "../schema";

export async function createUser(data: {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
}) {
  const now = new Date();
  const [newUser] = await db
    .insert(user)
    .values({
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return newUser;
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    emailVerified: boolean;
    image: string;
  }>,
) {
  const [updatedUser] = await db
    .update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, id))
    .returning();
  return updatedUser;
}

export async function deleteUser(id: string) {
  await db.delete(user).where(eq(user.id, id));
}
