"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { LoginActionState, RegisterActionState } from "../types";
import { authFormSchema, registerFormSchema } from "../types";

export async function signInWithEmailPassword(
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  try {
    const validatedData = authFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const { auth } = await import("../auth");

    try {
      await auth.api.signInEmail({
        body: {
          email: validatedData.email,
          password: validatedData.password,
        },
      });

      return { status: "success" };
    } catch (authError: any) {
      return {
        status: "invalid_credentials",
        message: "Invalid email or password",
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "An unexpected error occurred",
    };
  }
}

export async function signUpWithEmailPassword(
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  try {
    const validatedData = registerFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
    });

    const { auth } = await import("../auth");

    try {
      await auth.api.signUpEmail({
        body: {
          name: validatedData.name,
          email: validatedData.email,
          password: validatedData.password,
        },
      });

      return {
        status: "success",
        message:
          "Account created! Please check your email to verify your account.",
      };
    } catch (authError: any) {
      if (authError.message?.includes("already exists")) {
        return {
          status: "user_exists",
          message: "An account with this email already exists",
        };
      }
      return {
        status: "error",
        message: authError.message || "Failed to create account",
      };
    }
  } catch (error) {
    return {
      status: "error",
      message: "An unexpected error occurred",
    };
  }
}

export async function signOutAction() {
  try {
    const { auth } = await import("../auth");
    await auth.api.signOut({
      headers: {
        cookie: (await cookies()).toString(),
      },
    });
  } catch (error) {
    console.error("Sign out error:", error);
  }
  redirect("/login");
}
