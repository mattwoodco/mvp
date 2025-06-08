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
  const { user } = useAuth();

  const handleUpload = useCallback(
    async (file: File) => {
      if (!user) throw new Error("Unauthorized");
      return uploadAvatar(file);
    },
    [user],
  );

  return { handleUpload, currentAvatar: user?.image };
}
