import { getListings } from "@mvp/database";
import { Button } from "@mvp/ui/button";
import Link from "next/link";
import { DeleteButton } from "./(listings)/delete-button";
import { SendFoodEmailButton } from "./(listings)/send-food-email-button";
import { UploadForm } from "./(listings)/upload-form";
import { UserSection } from "./user-section";

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Listings</h1>
        <div className="flex items-center gap-4">
          <UserSection />
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings/preferences">Theme Settings</Link>
          </Button>
          <SendFoodEmailButton />

          <Button asChild>
            <Link href="/listing/new">Create Listing</Link>
          </Button>
        </div>
      </div>

      <div className="mb-8">
        <UploadForm />
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

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/listing/${listing.id}`}>Edit</Link>
              </Button>
              <DeleteButton id={listing.id} />
            </div>
          </div>
        ))}
      </div>

      {listings.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No listings found</p>
          <Button asChild>
            <Link href="/listing/new">Create Your First Listing</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
