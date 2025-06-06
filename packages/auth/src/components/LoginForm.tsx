"use client";

import { useActionState } from "react";
import { signInWithEmailPassword } from "../actions/auth-actions";
import type { LoginActionState } from "../types";

const initialLoginState: LoginActionState = { status: "idle" };

export function LoginForm() {
  const [loginState, loginAction, isLoginPending] = useActionState(
    signInWithEmailPassword,
    initialLoginState,
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Sign in</h2>

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
              defaultValue={
                process.env.NODE_ENV === "development" ? "matt@mattwood.co" : ""
              }
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
