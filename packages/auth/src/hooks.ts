import { upload } from "@mvp/storage";
import { useCallback } from "react";
import { useSession } from "./client";

export * from "./useAvatarUpload";

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
