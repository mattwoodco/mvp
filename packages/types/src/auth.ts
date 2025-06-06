import { z } from "zod";
import type { User } from "./database";

export const authFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const magicLinkSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type AuthFormData = z.infer<typeof authFormSchema>;
export type RegisterFormData = z.infer<typeof registerFormSchema>;
export type MagicLinkData = z.infer<typeof magicLinkSchema>;

export type AuthUser = Pick<
  User,
  | "id"
  | "name"
  | "email"
  | "emailVerified"
  | "image"
  | "createdAt"
  | "updatedAt"
>;

export type AuthSession = {
  user: AuthUser;
  sessionId: string;
  expiresAt: Date;
};

export type AuthActionState = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  field?: string;
};

export type LoginActionState = Omit<AuthActionState, "status"> & {
  status: "idle" | "loading" | "success" | "error" | "invalid_credentials";
};

export type RegisterActionState = Omit<AuthActionState, "status"> & {
  status:
    | "idle"
    | "loading"
    | "success"
    | "error"
    | "user_exists"
    | "invalid_data";
};

export type MagicLinkActionState = Omit<AuthActionState, "status"> & {
  status: "idle" | "loading" | "success" | "error" | "sent";
};
