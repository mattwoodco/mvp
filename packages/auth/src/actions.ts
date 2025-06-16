"use server";

import { updateUser } from "@mvp/database";
import { headers } from "next/headers";
import { auth } from "./auth";

export async function updateAuthUser(
  userId: string,
  data: { name?: string; email?: string; image?: string },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user || session.user.id !== userId)
    throw new Error("Unauthorized");
  return updateUser(userId, data);
}

export async function getSessionFromRequest(request: Request) {
  return auth.api.getSession({ headers: request.headers });
}
