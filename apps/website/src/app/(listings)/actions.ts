"use server";

import {
  createListing,
  deleteListing,
  getListingById,
  updateListing,
} from "@mvp/database";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteListingAction(id: string) {
  try {
    await deleteListing(id);
    revalidatePath("/");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to delete listing" };
  }
}

export async function createListingAction(formData: FormData) {
  const data = {
    id: crypto.randomUUID(),
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: formData.get("price") as string,
    userId: "temp-user-id",
  };

  await createListing(data);
  revalidatePath("/");
  redirect("/");
}

export async function updateListingAction(id: string, formData: FormData) {
  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    price: formData.get("price") as string,
  };

  await updateListing(id, data);
  revalidatePath("/");
  redirect("/");
}

export async function getListingByIdAction(id: string) {
  try {
    const listing = await getListingById(id);
    return { success: true, data: listing };
  } catch {
    return { success: false, error: "Failed to load listing" };
  }
}
