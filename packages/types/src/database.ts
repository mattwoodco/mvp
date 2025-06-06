import type {
  account,
  listing,
  session,
  user,
  verification,
} from "@mvp/database";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof user>;
export type NewUser = InferInsertModel<typeof user>;

export type Listing = InferSelectModel<typeof listing>;
export type NewListing = InferInsertModel<typeof listing>;

export type Session = InferSelectModel<typeof session>;
export type NewSession = InferInsertModel<typeof session>;

export type Account = InferSelectModel<typeof account>;
export type NewAccount = InferInsertModel<typeof account>;

export type Verification = InferSelectModel<typeof verification>;
export type NewVerification = InferInsertModel<typeof verification>;

export type UserWithListings = User & {
  listings: Listing[];
};

export type ListingWithUser = Listing & {
  user: Pick<User, "id" | "name" | "email" | "image">;
};
