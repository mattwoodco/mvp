// Client exports (for components)
export * from "./client";

// Server exports
export * from "./server";

// Hooks
export * from "./hooks";

// Types
export type {
  Account,
  Session,
  User,
  Verification,
} from "better-auth";

export type { Auth } from "./server";

export * from "./middleware";
export { magicLink as magicLinkPlugin } from "./plugins";
export * from "./schema";
export * from "./upload";
