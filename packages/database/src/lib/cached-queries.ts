import { unstable_cache } from "next/cache";
import { getListingById, getListings, getUserById, getUsers } from "./queries";

export const getCachedUsers = unstable_cache(
  async () => getUsers(),
  ["users"],
  { revalidate: 60 },
);

export const getCachedUserById = unstable_cache(
  async (id: string) => getUserById(id),
  ["user-by-id"],
  { revalidate: 60 },
);

export const getCachedListings = unstable_cache(
  async () => getListings(),
  ["listings"],
  { revalidate: 60 },
);

export const getCachedListingById = unstable_cache(
  async (id: string) => getListingById(id),
  ["listing-by-id"],
  { revalidate: 60 },
);
