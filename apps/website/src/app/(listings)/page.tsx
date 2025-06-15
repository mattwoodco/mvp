import { getListings } from "@mvp/database";
import { Button } from "@mvp/ui/button";
import Link from "next/link";
import { DeleteButton } from "./delete-button";
import { UploadForm } from "./upload-form";

export default async function ListingsPage() {
  const listings = await getListings();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <UploadForm />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="border border-border rounded-lg p-4 hover:shadow-lg transition-shadow bg-card"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold truncate text-foreground">
                {listing.title}
              </h2>
              <span className="text-primary font-bold">${listing.price}</span>
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
          <p className="text-muted-foreground mb-4">No listings found</p>
          <Button asChild>
            <Link href="/listing/new">Create Your First Listing</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
