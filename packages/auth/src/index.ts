// Client exports (for components)
export * from "./client";

// auth exports
export * from "./auth";

// Hooks
export * from "./hooks";

// Types
export type {
  Account,
  Session,
  User,
  Verification,
} from "better-auth";

export type { Auth } from "./auth";

export * from "./middleware";
export { magicLink as magicLinkPlugin } from "./plugins";
