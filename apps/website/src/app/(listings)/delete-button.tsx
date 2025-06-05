"use client";

import { deleteListingAction } from "./actions";

interface DeleteButtonProps {
  id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    const result = await deleteListingAction(id);
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <button
      type="button"
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
      onClick={handleDelete}
    >
      Delete
    </button>
  );
}
