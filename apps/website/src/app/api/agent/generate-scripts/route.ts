import {
  type ScriptGenerationRequest,
  scriptGeneratorAgent,
  workflowManager,
} from "@chatmtv/agent";
import { auth } from "@mvp/auth/server";
import { db, scriptGeneration } from "@mvp/database";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Check authentication using better-auth
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request body
    if (!body.productName || !body.productDescription || !body.targetAudience) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: productName, productDescription, targetAudience",
        },
        { status: 400 },
      );
    }

    // Create script generation request
    const scriptRequest: ScriptGenerationRequest = {
      userId,
      productName: body.productName,
      productDescription: body.productDescription,
      targetAudience: body.targetAudience,
      keyBenefits: body.keyBenefits || [],
      brandTone: body.brandTone,
      competitorInfo: body.competitorInfo,
      customPrompt: body.customPrompt,
      variationCount: Math.min(body.variationCount || 12, 12),
    };

    // Save request to database
    const generationId = nanoid();
    await db.insert(scriptGeneration).values({
      id: generationId,
      userId,
      productName: scriptRequest.productName,
      productDescription: scriptRequest.productDescription,
      targetAudience: scriptRequest.targetAudience,
      keyBenefits: scriptRequest.keyBenefits,
      brandTone: scriptRequest.brandTone,
      competitorInfo: scriptRequest.competitorInfo,
      customPrompt: scriptRequest.customPrompt,
      variationCount: scriptRequest.variationCount,
      status: "pending",
    });

    // Start workflow
    const workflowId =
      await workflowManager.createScriptGenerationWorkflow(scriptRequest);

    return NextResponse.json({
      success: true,
      workflowId,
      generationId,
    });
  } catch (error) {
    console.error("Script generation error:", error);
    return NextResponse.json(
      { error: "Failed to start script generation" },
      { status: 500 },
    );
  }
}
