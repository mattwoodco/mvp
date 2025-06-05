import { eq } from "drizzle-orm";
import { db } from "../client";
import { listing, user } from "../schema";

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

export async function createListing(data: {
  id: string;
  title: string;
  description?: string;
  price: string;
  userId: string;
}) {
  const now = new Date();
  const [newListing] = await db
    .insert(listing)
    .values({
      ...data,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return newListing;
}

export async function updateListing(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    price: string;
    isActive: boolean;
  }>,
) {
  const [updatedListing] = await db
    .update(listing)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(listing.id, id))
    .returning();
  return updatedListing;
}

export async function deleteListing(id: string) {
  await db.delete(listing).where(eq(listing.id, id));
}
