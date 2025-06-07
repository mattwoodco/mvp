// Client exports (for components)
export * from "./client";

// Server exports
export * from "./server";

// Hooks
export * from "./hooks";

// Types
export type {
  User,
  Session,
  Account,
  Verification,
} from "better-auth";

export type { Auth } from "./server";

export * from "./schema";
export * from "./plugins";
export * from "./middleware";
export * from "./upload";
