"use client";

export function DeleteButton() {
  return (
    <button
      type="submit"
      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
      onClick={(e) => {
        if (!confirm("Are you sure you want to delete this user?")) {
          e.preventDefault();
        }
      }}
    >
      Delete
    </button>
  );
}
