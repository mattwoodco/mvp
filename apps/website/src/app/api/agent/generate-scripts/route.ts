import {
  type ScriptGenerationRequest,
  scriptGeneratorAgent,
  workflowManager,
} from "@mvp/agent";
import { auth } from "@mvp/auth/server";
import { db, scriptGeneration } from "@mvp/database";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("Starting script generation request");

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("Auth session:", session?.user?.id ? "Valid" : "Invalid");

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    if (!body.productName || !body.productDescription || !body.targetAudience) {
      console.log("Missing required fields:", {
        productName: !!body.productName,
        productDescription: !!body.productDescription,
        targetAudience: !!body.targetAudience,
      });
      return NextResponse.json(
        {
          error:
            "Missing required fields: productName, productDescription, targetAudience",
        },
        { status: 400 },
      );
    }

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

    console.log("Creating script generation record");
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
    console.log("Script generation record created:", generationId);

    console.log("Starting workflow");
    const workflowId = await workflowManager.createScriptGenerationWorkflow({
      ...scriptRequest,
      generationId,
    });
    console.log("Workflow created:", workflowId);

    return NextResponse.json({
      success: true,
      workflowId,
      generationId,
    });
  } catch (error) {
    console.error("Script generation error:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    return NextResponse.json(
      { error: "Failed to start script generation" },
      { status: 500 },
    );
  }
}
