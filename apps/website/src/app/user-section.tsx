"use client";

import { signOut } from "@mvp/auth/client";
import { useAuth } from "@mvp/auth/hooks";
import { Button } from "@mvp/ui/button";
import Link from "next/link";
import { toast } from "sonner";

export function UserSection() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600" />
        <span className="text-sm text-gray-600">Loading...</span>
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
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />
        )}
        <div className="text-sm">
          <p className="font-medium text-gray-900">{user.name || "User"}</p>
          <p className="text-gray-500 text-xs">{user.email}</p>
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
          className="text-red-600 hover:text-red-700 hover:border-red-300"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
