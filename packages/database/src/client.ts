import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const env = process.env.APP_ENV || "local";
config({ path: env === "local" ? ".env.local" : `.env.${env}.local` });

export const db = drizzle(postgres(process.env.DATABASE_URL!), { schema });
