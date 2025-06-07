export * from "./server";
export * from "./client";
export * from "./schema";
export * from "./plugins";
export * from "./hooks";

// Re-export commonly used types and utilities from better-auth
export type {
  User,
  Session,
  Account,
  Verification,
} from "better-auth";
