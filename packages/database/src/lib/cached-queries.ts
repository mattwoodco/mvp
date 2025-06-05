import { unstable_cache } from "next/cache";
import { getUserById, getUsers } from "./queries";

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
