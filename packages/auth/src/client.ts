import { createAuthClient } from "better-auth/react";
import type { Auth } from "./server";

export const authClient = createAuthClient<Auth>({
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
