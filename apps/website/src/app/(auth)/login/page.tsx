"use client";

import { signIn } from "@money/auth/client";
import { Button } from "@money/ui/button";
import { Input } from "@money/ui/input";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { toast } from "sonner";

const DEFAULT_EMAIL =
  process.env.NODE_ENV === "development" ? "matt@mattwood.co" : "";

function LoginContent() {
  const [email, setEmail] = useState(DEFAULT_EMAIL);
  const [password, setPassword] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState(DEFAULT_EMAIL);
  const [isLoading, setIsLoading] = useState(false);
  const [isMagicLinkLoading, setIsMagicLinkLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [activeTab, setActiveTab] = useState<"email-password" | "magic-link">(
    "email-password",
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const handleEmailPasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: from,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to sign in");
      } else {
        toast.success("Signed in successfully!");
        setEmail("");
        setPassword("");
        router.push(from);
      }
    } catch (error) {
      console.error("Signin error:", error);
      toast.error("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMagicLinkLoading(true);

    try {
      const result = await signIn.magicLink({
        email: magicLinkEmail,
        callbackURL: from,
      });

      if (result.error) {
        toast.error(result.error.message || "Failed to send magic link");
      } else {
        toast.success("Magic link sent! Check your email.");
        setMagicLinkSent(true);
      }
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsMagicLinkLoading(false);
    }
  };

  return (
    <div className="container mx-auto flex items-center justify-center py-12">
      <div className="w-full max-w-md p-6 bg-card border border-border rounded-lg shadow-md">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-center text-foreground">
            Sign In
          </h1>
          <p className="mt-2 text-sm text-center text-muted-foreground">
            Choose your preferred method to sign in to your account
          </p>
        </div>

        <div className="mb-4">
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveTab("email-password")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "email-password"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("magic-link")}
              className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === "magic-link"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Magic Link
            </button>
          </div>
        </div>

        {activeTab === "email-password" && (
          <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-1"
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
                className="block text-sm font-medium text-foreground mb-1"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        )}

        {activeTab === "magic-link" && magicLinkSent && (
          <div className="text-center space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-green-800 dark:text-green-200">
                <h3 className="font-medium">Check your email!</h3>
                <p className="text-sm mt-1">
                  We've sent a magic link to {magicLinkEmail}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => setMagicLinkSent(false)}
              className="w-full"
            >
              Send another link
            </Button>
          </div>
        )}

        {activeTab === "magic-link" && !magicLinkSent && (
          <form onSubmit={handleMagicLinkSignIn} className="space-y-4">
            <div>
              <label
                htmlFor="magic-email"
                className="block text-sm font-medium text-foreground mb-1"
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
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center text-foreground">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
