"use client";

import { useActionState } from "react";
import { signUpWithEmailPassword } from "../actions/auth-actions";
import type { RegisterActionState } from "../types";

const initialRegisterState: RegisterActionState = { status: "idle" };

export function RegisterForm() {
  const [registerState, registerAction, isRegisterPending] = useActionState(
    signUpWithEmailPassword,
    initialRegisterState,
  );

  if (registerState.status === "success") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
          <h3 className="text-lg font-medium text-green-900 mb-2">
            Account Created!
          </h3>
          <p className="text-green-700">{registerState.message}</p>
          <a
            href="/login"
            className="mt-4 inline-block text-sm text-green-600 hover:text-green-800 underline"
          >
            Sign in to your account
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

        <form action={registerAction} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>

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

          {registerState.status === "user_exists" && (
            <div className="text-red-600 text-sm">{registerState.message}</div>
          )}

          {registerState.status === "error" && (
            <div className="text-red-600 text-sm">{registerState.message}</div>
          )}

          <button
            type="submit"
            disabled={isRegisterPending}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRegisterPending ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
