import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession, getSession, magicLink } =
  authClient;
