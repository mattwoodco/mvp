import { eq } from "drizzle-orm";
import { db } from "../client";
import { listing, user } from "../schema";

export async function getUsers() {
  return await db.select().from(user);
}

export async function getUserById(id: string) {
  const [result] = await db.select().from(user).where(eq(user.id, id));
  return result;
}

export async function getUserByEmail(email: string) {
  const [result] = await db.select().from(user).where(eq(user.email, email));
  return result;
}

export async function getListings() {
  return await db.select().from(listing).where(eq(listing.isActive, true));
}

export async function getListingById(id: string) {
  const [result] = await db.select().from(listing).where(eq(listing.id, id));
  return result;
}
