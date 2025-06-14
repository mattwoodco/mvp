"use client";

import { signOut } from "@money/auth/client";
import { useAuth } from "@money/auth/hooks";
import { Button } from "@money/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function UserSection() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center gap-2">
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
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
        )}
        <div className="text-sm">
          <p className="font-medium text-foreground">{user.name || "User"}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/settings/profile">Profile</Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="text-destructive hover:text-destructive/90 hover:border-destructive/50"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
