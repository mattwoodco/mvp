import { useCallback } from "react";
import { useSession } from "./client";
import { uploadAvatar } from "./upload";

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

export function useRequireAuth() {
  const { session, user, isAuthenticated, isLoading, error } = useAuth();

  if (!isLoading && !isAuthenticated) {
    throw new Error("Authentication required");
  }

  return {
    session: session!,
    user: user!,
    isLoading,
    error,
  };
}

export function useAvatarUpload() {
  const { user } = useRequireAuth();

  const handleUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image");
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB");
    }

    return await uploadAvatar(file);
  }, []);

  return { handleUpload, currentAvatar: user?.image };
}
