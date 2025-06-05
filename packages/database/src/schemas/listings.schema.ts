import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const listing = pgTable("listing", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  squareFeet: integer("square_feet"),
  isActive: boolean("is_active").notNull().default(true),
  userId: text("user_id").notNull(),
  images: text("images").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
