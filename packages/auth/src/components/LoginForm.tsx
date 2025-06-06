"use client";

import { useActionState, useState } from "react";
import {
  sendMagicLink,
  signInWithEmailPassword,
} from "../actions/auth-actions";
import type { LoginActionState, MagicLinkActionState } from "../types";

const initialLoginState: LoginActionState = { status: "idle" };
const initialMagicLinkState: MagicLinkActionState = { status: "idle" };

export function LoginForm() {
  const [mode, setMode] = useState<"password" | "magic">("password");

  const [loginState, loginAction, isLoginPending] = useActionState(
    signInWithEmailPassword,
    initialLoginState,
  );
  const [magicLinkState, magicLinkAction, isMagicLinkPending] = useActionState(
    sendMagicLink,
    initialMagicLinkState,
  );

  if (magicLinkState.status === "sent") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Check your email
          </h3>
          <p className="text-green-700">{magicLinkState.message}</p>
          <button
            type="button"
            onClick={() => setMode("password")}
            className="mt-4 text-sm text-green-600 hover:text-green-800 underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Sign in</h2>

        <div className="flex mb-6 bg-gray-100 rounded-lg">
          <button
            type="button"
            onClick={() => setMode("password")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === "password"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => setMode("magic")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              mode === "magic"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Magic Link
          </button>
        </div>

        {mode === "password" ? (
          <form action={loginAction} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
              />
            </div>

            {loginState.status === "invalid_credentials" && (
              <div className="text-red-600 text-sm">{loginState.message}</div>
            )}

            {loginState.status === "error" && (
              <div className="text-red-600 text-sm">{loginState.message}</div>
            )}

            <button
              type="submit"
              disabled={isLoginPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoginPending ? "Signing in..." : "Sign in"}
            </button>
          </form>
        ) : (
          <form action={magicLinkAction} className="space-y-4">
            <div>
              <label
                htmlFor="magic-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                id="magic-email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>

            {magicLinkState.status === "error" && (
              <div className="text-red-600 text-sm">
                {magicLinkState.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isMagicLinkPending}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isMagicLinkPending ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
