import { createListingAction } from "../../actions";
import { ListingForm } from "../../listing-form";

export default function NewListingPage() {
  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Create New Listing</h1>
      <ListingForm action={createListingAction} />
    </div>
  );
}
