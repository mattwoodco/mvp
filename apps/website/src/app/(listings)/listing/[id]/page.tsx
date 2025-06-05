import { redirect } from "next/navigation";
import { getListingByIdAction, updateListingAction } from "../../actions";
import { ListingForm } from "../../listing-form";

interface EditListingPageProps {
  params: { id: string };
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const result = await getListingByIdAction(params.id);
  if (!result.success || !result.data) redirect("/");

  const listing = result.data;
  const updateWithId = updateListingAction.bind(null, params.id);

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>
      <ListingForm listing={listing} action={updateWithId} />
    </div>
  );
}
