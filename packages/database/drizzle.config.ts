import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const env = process.env.APP_ENV || "local";
config({ path: env === "local" ? ".env.local" : `.env.${env}.local` });

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
});
