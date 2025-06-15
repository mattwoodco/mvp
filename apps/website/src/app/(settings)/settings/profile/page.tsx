"use client";

import { useAuth, useAvatarUpload } from "@mvp/auth/hooks";
import { Button } from "@mvp/ui/button";
import { Input } from "@mvp/ui/input";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { handleAvatarUpload, currentAvatar, isUploading, error } =
    useAvatarUpload();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      await handleAvatarUpload(file);
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar");
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You need to be logged in to view this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Profile Settings
          </h1>

          {/* Avatar Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Profile Picture
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-muted overflow-hidden border-2 border-border">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <svg
                        className="w-8 h-8"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Button
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  variant="outline"
                >
                  {isUploading ? "Uploading..." : "Change Avatar"}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* User Information */}
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-foreground">
              Account Information
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="user-name"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Full Name
                </label>
                <Input
                  id="user-name"
                  type="text"
                  value={user.name || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <label
                  htmlFor="user-email"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  Email Address
                </label>
                <Input
                  id="user-email"
                  type="email"
                  value={user.email || ""}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div>
                <label
                  htmlFor="user-id"
                  className="block text-sm font-medium text-foreground mb-1"
                >
                  User ID
                </label>
                <Input
                  id="user-id"
                  type="text"
                  value={user.id || ""}
                  disabled
                  className="bg-muted font-mono text-xs"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                To update your email address or other account settings, please
                contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
