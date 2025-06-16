"use client";

import { upload } from "@mvp/storage";
import type { User } from "better-auth";
import { magicLinkClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { useCallback, useState } from "react";
import { updateAuthUser } from "./actions";

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth`,
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

export function useProfileUpdate() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!user) throw new Error("Unauthorized");
      setIsUpdating(true);
      try {
        const updateData = Object.fromEntries(
          Object.entries(data).filter(([_, v]) => v != null),
        );
        await updateAuthUser(user.id, updateData);
        await authClient.updateUser(updateData);
      } finally {
        setIsUpdating(false);
      }
    },
    [user],
  );

  return { updateProfile, isUpdating };
}

export function useTokens() {
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const updateTokens = useCallback(
    async (tokens: number) => {
      if (!user) throw new Error("Unauthorized");
      setIsUpdating(true);
      try {
        await updateAuthUser(user.id, { tokens });
      } finally {
        setIsUpdating(false);
      }
    },
    [user],
  );

  return {
    tokens: (user as any)?.tokens || 0,
    updateTokens,
    isUpdating,
  };
}
