import { authClient } from "./client";

export function useAuth() {
  return {
    signIn: authClient.signIn,
    signOut: authClient.signOut,
    getSession: authClient.getSession,
    useSession: authClient.useSession,
  };
}
