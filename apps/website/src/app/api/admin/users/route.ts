import { getUsersWithAdminInfo } from "@mvp/database/lib/admin-queries";
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
      emailVerified:
        searchParams.get("emailVerified") === "true"
          ? true
          : searchParams.get("emailVerified") === "false"
            ? false
            : undefined,
      createdFrom: searchParams.get("createdFrom")
        ? new Date(searchParams.get("createdFrom")!)
        : undefined,
      createdTo: searchParams.get("createdTo")
        ? new Date(searchParams.get("createdTo")!)
        : undefined,
      hasRole: searchParams.get("hasRole") === "true" ? true : undefined,
    };

    const result = await getUsersWithAdminInfo(filters, { page, pageSize });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}
