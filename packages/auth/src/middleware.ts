import type { NextRequest } from "next/server";
import { auth } from "./auth";

export async function getSessionFromRequest(request: NextRequest) {
  return await auth.api.getSession({
    headers: request.headers,
  });
}
