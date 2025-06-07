"use client";

import { signIn, signUp } from "@mvp/auth/client";
import { Button } from "@mvp/ui/button";
import { Input } from "@mvp/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const [magicLinkName, setMagicLinkName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"email-password" | "magic-link">(
    "email-password",
  );
  const router = useRouter();

  const handleEmailPasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signUp.email({
        email,
        password,
        name,
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to sign up");
      } else {
        toast.success("Account created successfully!");
        router.push("/");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMagicLinkLoading(true);

    try {
      // For magic link signup, we can use the sign in method since it auto-creates accounts
      const result = await signIn.magicLink({
        email: magicLinkEmail,
        callbackURL: "/",
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send magic link");
      } else {
        toast.success(
          "Magic link sent! Check your email to complete registration.",
        );
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center text-gray-900">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-center text-gray-600">
            Choose your preferred method to create your account
          </p>
        </div>

        <div className="mb-4">
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("email-password")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "email-password"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("magic-link")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "magic-link"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Magic Link
            </button>
          </div>
        </div>

        {activeTab === "email-password" && (
          <form onSubmit={handleEmailPasswordSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password (min. 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        )}

        {activeTab === "magic-link" && (
          <form onSubmit={handleMagicLinkSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="magic-name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name
              </label>
              <Input
                id="magic-name"
                type="text"
                placeholder="Enter your full name"
                value={magicLinkName}
                onChange={(e) => setMagicLinkName(e.target.value)}
                required
              />
            </div>
            <div>
              <label
                htmlFor="magic-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <Input
                id="magic-email"
                type="email"
                placeholder="Enter your email"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isMagicLinkLoading}
            >
              {isMagicLinkLoading ? "Sending..." : "Send Magic Link"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
