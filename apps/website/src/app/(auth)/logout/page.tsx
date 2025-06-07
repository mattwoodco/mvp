"use client";

import { signOut } from "@mvp/auth/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut();
        toast.success("Logged out successfully!");
        router.push("/login");
      } catch (error) {
        toast.error("Failed to log out");
        router.push("/");
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Logging out...
        </h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto" />
      </div>
    </div>
  );
}
