import { getListingsWithUserInfo } from "@mvp/database/lib/admin-queries";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse pagination
    const page = Number.parseInt(searchParams.get("page") || "1");
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10");

    // Parse filters
    const filters = {
      search: searchParams.get("search") || undefined,
      isActive:
        searchParams.get("isActive") === "true"
          ? true
          : searchParams.get("isActive") === "false"
            ? false
            : undefined,
      priceMin: searchParams.get("priceMin")
        ? Number.parseFloat(searchParams.get("priceMin")!)
        : undefined,
      priceMax: searchParams.get("priceMax")
        ? Number.parseFloat(searchParams.get("priceMax")!)
        : undefined,
      userId: searchParams.get("userId") || undefined,
      createdFrom: searchParams.get("createdFrom")
        ? new Date(searchParams.get("createdFrom")!)
        : undefined,
      createdTo: searchParams.get("createdTo")
        ? new Date(searchParams.get("createdTo")!)
        : undefined,
    };

    const result = await getListingsWithUserInfo(filters, { page, pageSize });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching listings:", error);
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 },
    );
  }
}
