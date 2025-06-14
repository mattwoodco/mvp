import {
  boolean,
  decimal,
  index,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./users.schema";

export const plaidItem = pgTable(
  "plaid_item",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token").notNull(),
    institutionId: text("institution_id").notNull(),
    institutionName: text("institution_name"),
    cursor: text("cursor"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("plaid_item_user_id_idx").on(table.userId),
  }),
);

export const plaidAccount = pgTable(
  "plaid_account",
  {
    id: text("id").primaryKey(),
    itemId: text("item_id")
      .notNull()
      .references(() => plaidItem.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    name: text("name").notNull(),
    officialName: text("official_name"),
    mask: varchar("mask", { length: 4 }),
    type: text("type").notNull(),
    subtype: text("subtype"),

    currentBalance: decimal("current_balance", { precision: 15, scale: 2 }),
    availableBalance: decimal("available_balance", { precision: 15, scale: 2 }),
    isoCurrencyCode: varchar("iso_currency_code", { length: 3 }),

    isActive: boolean("is_active").default(true),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    itemIdIdx: index("plaid_account_item_id_idx").on(table.itemId),
    userIdIdx: index("plaid_account_user_id_idx").on(table.userId),
  }),
);

export const plaidTransaction = pgTable(
  "plaid_transaction",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id")
      .notNull()
      .references(() => plaidAccount.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),

    amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
    isoCurrencyCode: varchar("iso_currency_code", { length: 3 }),
    description: text("description"),
    merchantName: text("merchant_name"),

    category: text("category"),
    subcategory: text("subcategory"),

    date: text("date").notNull(),
    authorizedDate: text("authorized_date"),

    pending: boolean("pending").default(false),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    accountIdIdx: index("plaid_transaction_account_id_idx").on(table.accountId),
    userIdIdx: index("plaid_transaction_user_id_idx").on(table.userId),
    dateIdx: index("plaid_transaction_date_idx").on(table.date),
    categoryIdx: index("plaid_transaction_category_idx").on(table.category),
  }),
);
