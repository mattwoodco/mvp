"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useAuth,
  useAvatarUpload,
  useProfileUpdate,
  useTokens,
} from "@mvp/auth";
import { createTokenCheckoutSession } from "@mvp/payments";
import { Button } from "@mvp/ui/button";
import { CheckoutForm } from "@mvp/ui/checkout-form";
import { Input } from "@mvp/ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

function useDebounce<T>(callback: (value: T) => void, delay: number) {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(value);
      }, delay);
    },
    [delay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const { uploadAvatar, currentAvatar, isUploading } = useAvatarUpload();
  const { updateProfile, isUpdating } = useProfileUpdate();
  const { tokens, updateTokens, isUpdating: isTokenUpdating } = useTokens();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user?.name]);

  const handleNameUpdate = useCallback(
    async (newName: string) => {
      if (!newName.trim() || newName === user?.name) return;
      if (newName.length < 2) return;

      setIsSaving(true);
      try {
        await updateProfile({ name: newName });
        toast.success("Name updated");
      } catch (error) {
        console.error("Update error:", error);
        toast.error("Failed to update name");
        setName(user?.name || "");
      } finally {
        setIsSaving(false);
      }
    },
    [user?.name, updateProfile],
  );

  const debouncedUpdate = useDebounce(handleNameUpdate, 1000);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    debouncedUpdate(value);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      await uploadAvatar(file);
      toast.success("Avatar updated successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload avatar");
    }
  };

  const handleTokenChange = async (change: number) => {
    const newTokens = Math.max(0, tokens + change);
    try {
      await updateTokens(newTokens);
      toast.success(`Tokens ${change > 0 ? "added" : "removed"}`);
    } catch (error) {
      console.error("Token update error:", error);
      toast.error("Failed to update tokens");
    }
  };

  const handleTokenPurchase = async (tokenAmount: number) => {
    try {
      if (!user) {
        toast.error("User not authenticated");
        return;
      }

      const userWithStripe = user as any;
      if (!userWithStripe?.stripeCustomerId) {
        toast.error("Stripe customer not found");
        return;
      }

      const session = await createTokenCheckoutSession({
        userId: user.id,
        tokens: tokenAmount,
        successUrl: `${window.location.origin}/settings/profile?success=true`,
        cancelUrl: `${window.location.origin}/settings/profile?canceled=true`,
        stripeCustomerId: userWithStripe.stripeCustomerId,
      });

      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to initiate purchase");
    }
  };

  const form = useForm<{ name: string; email: string }>({
    resolver: zodResolver(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
      }),
    ),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-card border border-border rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-foreground mb-6">
            Profile Settings
          </h1>

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
                  {isSaving && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Saving...
                    </span>
                  )}
                </label>
                <Input
                  id="user-name"
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="bg-muted"
                  disabled={isUpdating}
                  placeholder="Enter your full name"
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
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
                  readOnly
                  className="bg-muted"
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

        <div className="bg-card border border-border rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Token Management
          </h2>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
            <div>
              <p className="text-lg font-bold">{tokens.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Current Balance</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTokenChange(-100)}
                disabled={isTokenUpdating || tokens < 100}
              >
                -100
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTokenChange(100)}
                disabled={isTokenUpdating}
              >
                +100
              </Button>
            </div>
          </div>

          <CheckoutForm
            onPurchase={handleTokenPurchase}
            isLoading={isTokenUpdating}
          />
        </div>
      </div>
    </div>
  );
}
