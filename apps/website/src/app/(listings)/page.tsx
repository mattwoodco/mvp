import { Link } from "lucide-react";
import { getListings } from "../../../../../packages/database/src/lib/queries";
import { DeleteButton } from "./delete-button";

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Listings</h1>
        <Link
          href="/listing/new"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Create Listing
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold truncate">
                {listing.title}
              </h2>
              <span className="text-green-600 font-bold">${listing.price}</span>
            </div>

            <p className="text-gray-600 mb-2">{listing.address}</p>
            {listing.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-3">
                {listing.description}
              </p>
            )}
            <div className="flex gap-4 text-sm text-gray-600 mb-4">
              {listing.bedrooms && <span>{listing.bedrooms} bed</span>}
              {listing.bathrooms && <span>{listing.bathrooms} bath</span>}
              {listing.squareFeet && <span>{listing.squareFeet} sqft</span>}
            </div>
            <div className="flex gap-2">
              <Link
                href={`/listing/${listing.id}`}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
              >
                Edit
              </Link>
              <DeleteButton id={listing.id} />
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No listings found</p>
          <Link
            href="/listing/new"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Create Your First Listing
          </Link>
        </div>
      )}
    </div>
  );
}
