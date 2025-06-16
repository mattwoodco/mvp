"use client";

import { Button } from "@mvp/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { signOut, useAuth } from "./client";

export function UserSection() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading)
    return (
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
    );

  if (!isAuthenticated) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/login">Sign In</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/register">Sign Up</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.image && (
          <img
            src={user.image}
            alt="Profile"
            className="w-8 h-8 rounded-full border"
          />
        )}
        <div className="text-sm">
          <p className="font-medium">{user.name || "User"}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/profile">Profile</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => signOut().then(() => toast.success("Logged out!"))}
          className="text-destructive hover:text-destructive/90"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
