"use client";

import { Button } from "@mvp/ui/button";
import { Input } from "@mvp/ui/input";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

interface ListingFormProps {
  listing?: {
    id: string;
    title: string;
    address: string;
    price: string;
    bedrooms?: number | null;
    bathrooms?: number | null;
    squareFeet?: number | null;
    description?: string | null;
  };
  action: (formData: FormData) => Promise<void>;
}

export function ListingForm({ listing, action }: ListingFormProps) {
  const router = useRouter();

  return (
    <form action={action} className="space-y-6">
      <Input
        name="title"
        placeholder="Title"
        defaultValue={listing?.title}
        required
      />
      <Input
        name="address"
        placeholder="Address"
        defaultValue={listing?.address}
        required
      />
      <Input
        name="price"
        type="number"
        step="0.01"
        placeholder="Price"
        defaultValue={listing?.price}
        required
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          name="bedrooms"
          type="number"
          placeholder="Bedrooms"
          defaultValue={listing?.bedrooms || ""}
        />
        <Input
          name="bathrooms"
          type="number"
          placeholder="Bathrooms"
          defaultValue={listing?.bathrooms || ""}
        />
        <Input
          name="squareFeet"
          type="number"
          placeholder="Sq Ft"
          defaultValue={listing?.squareFeet || ""}
        />
      </div>

      <textarea
        name="description"
        rows={4}
        placeholder="Description"
        defaultValue={listing?.description || ""}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="flex gap-4">
        <SubmitButton isUpdate={!!listing} />
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function SubmitButton({ isUpdate }: { isUpdate: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving..." : isUpdate ? "Update" : "Create"}
    </Button>
  );
}
