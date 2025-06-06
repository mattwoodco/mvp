import { createAuthClient } from "better-auth/client";
import { twoFactorClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [
    twoFactorClient({
      onTwoFactorRedirect() {
        // This will be handled by the consuming app
        window.location.href = "/auth/2fa";
      },
    }),
  ],
});

export type AuthClient = typeof authClient;