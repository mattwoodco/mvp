"use client";

import { upload } from "@mvp/storage";
import { useCallback, useState } from "react";
import { updateAuthUser } from "./actions";
import { authClient } from "./client";
import { useAuth } from "./hooks";

export function useAvatarUpload() {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (!user) throw new Error("Unauthorized");

      setIsUploading(true);
      setError(null);

      try {
        const image = await upload(file.name, file);
        if (image) {
          await updateAuthUser(user.id, { image });
          await authClient.updateUser({ image });
        } else {
          throw new Error("Upload failed");
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Upload failed"));
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [user],
  );

  return {
    handleAvatarUpload,
    currentAvatar: user?.image,
    isUploading,
    error,
  };
}
