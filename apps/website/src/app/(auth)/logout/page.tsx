"use client";

import { signOut } from "@mvp/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LogoutPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut();
        toast.success("Logged out successfully!");
        router.push("/login");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Failed to log out. Please try again.");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    handleLogout();
  }, [router]);

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          {isLoading ? "Logging out..." : "Logout complete"}
        </h1>
        {isLoading && (
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto" />
        )}
      </div>
    </div>
  );
}
