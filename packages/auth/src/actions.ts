"use server";

import { updateUser as updateUserDb } from "@mvp/database";
import { headers } from "next/headers";
import { auth } from "./auth";

export async function updateAuthUser(
  userId: string,
  data: {
    name?: string;
    email?: string;
    emailVerified?: boolean;
    image?: string;
  },
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const user = await updateUserDb(session.user.id, data);
  return user;
}
