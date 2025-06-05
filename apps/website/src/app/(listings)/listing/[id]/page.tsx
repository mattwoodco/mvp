import { redirect } from "next/navigation";
import { getListingByIdAction, updateListingAction } from "../../actions";

interface EditListingPageProps {
  params: { id: string };
}

export default async function EditListingPage({
  params,
}: EditListingPageProps) {
  const result = await getListingByIdAction(params.id);

  if (!result.success || !result.data) {
    redirect("/");
  }

  const listing = result.data;
  const updateWithId = updateListingAction.bind(null, params.id);

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Edit Listing</h1>

      <form action={updateWithId} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={listing.title}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium mb-2">
            Address *
          </label>
          <input
            id="address"
            name="address"
            type="text"
            required
            defaultValue={listing.address}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-medium mb-2">
            Price *
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            required
            defaultValue={listing.price}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="bedrooms"
              className="block text-sm font-medium mb-2"
            >
              Bedrooms
            </label>
            <input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min="0"
              defaultValue={listing.bedrooms || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="bathrooms"
              className="block text-sm font-medium mb-2"
            >
              Bathrooms
            </label>
            <input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min="0"
              defaultValue={listing.bathrooms || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="squareFeet"
              className="block text-sm font-medium mb-2"
            >
              Square Feet
            </label>
            <input
              id="squareFeet"
              name="squareFeet"
              type="number"
              min="0"
              defaultValue={listing.squareFeet || ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium mb-2"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={listing.description || ""}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your property..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
          >
            Update Listing
          </button>
        </div>
      </form>
    </div>
  );
}
