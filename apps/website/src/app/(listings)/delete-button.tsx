"use client";

import { Button } from "@money/ui/button";
import { deleteListingAction } from "./actions";

interface DeleteButtonProps {
  id: string;
}

export function DeleteButton({ id }: DeleteButtonProps) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    const result = await deleteListingAction(id);
    if (!result.success) alert(result.error);
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete}>
      Delete
    </Button>
  );
}
