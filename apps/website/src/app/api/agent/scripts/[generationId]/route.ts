import { auth } from "@chatmtv/auth/server";
import { db, scriptGeneration } from "@chatmtv/database";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  context: { params: Promise<{ generationId: string }> },
) {
  try {
    const { generationId } = await context.params;
    console.log("Fetching scripts for generationId:", generationId);

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      console.log("Unauthorized: No valid session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Querying database for generation:", generationId);

    const generation = await db.query.scriptGeneration.findFirst({
      where: eq(scriptGeneration.id, generationId),
      with: {
        variations: true,
      },
    });

    console.log("Generation status:", generation?.status);
    console.log("Variations count:", generation?.variations?.length);

    if (!generation) {
      console.log("Generation not found");
      return NextResponse.json(
        { error: "Generation not found" },
        { status: 404 },
      );
    }

    if (generation.userId !== session.user.id) {
      console.log("Unauthorized: User ID mismatch");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Transform variations to include attributes object
    const transformedGeneration = {
      ...generation,
      variations: generation.variations?.map((variation) => ({
        ...variation,
        attributes: {
          hookStyle: variation.hookStyle,
          adCategory: variation.adCategory,
          copywritingTone: variation.copywritingTone,
          visualStyle: variation.visualStyle,
          problemSolutionFraming: variation.problemSolutionFraming,
          pacingStyle: variation.pacingStyle,
          ctaApproach: variation.ctaApproach,
        },
      })),
    };

    return NextResponse.json(transformedGeneration);
  } catch (error) {
    console.error("Error fetching scripts:", error);
    return NextResponse.json(
      { error: "Failed to fetch scripts" },
      { status: 500 },
    );
  }
}
