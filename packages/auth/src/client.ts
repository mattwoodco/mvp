"use client";

import { upload } from "@mvp/storage";
import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useCallback, useState } from "react";
import { updateAuthUser } from "./actions";

export const authClient = createAuthClient({
  baseURL:
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth`,
  plugins: [magicLinkClient()],
});

export const { signIn, signUp, signOut, useSession, getSession, magicLink } =
  authClient;

export function useAuth() {
  const { data: session, isPending, error } = useSession();
  return {
    session,
    user: session?.user,
    isAuthenticated: !!session?.user,
    isLoading: isPending,
    error,
  };
}

export function useAvatarUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) throw new Error("Unauthorized");
      setIsUploading(true);
      try {
        const image = await upload(file.name, file);
        if (!image) throw new Error("Failed to upload avatar");
        await updateAuthUser(user.id, { image });
        await authClient.updateUser({ image });
        return image;
      } finally {
        setIsUploading(false);
      }
    },
    [user],
  );

  return { uploadAvatar, isUploading, currentAvatar: user?.image };
}
