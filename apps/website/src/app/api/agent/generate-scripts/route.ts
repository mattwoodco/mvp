import { type ScriptGenerationRequest, workflowManager } from "@mvp/agent";
import { auth } from "@mvp/auth";
import { db, scriptGeneration } from "@mvp/database";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    console.log("[generate-scripts] Starting script generation request");

    console.log("[generate-scripts] Environment validation:");
    console.log("[generate-scripts] NODE_ENV:", process.env.NODE_ENV);
    console.log("[generate-scripts] VERCEL_ENV:", process.env.VERCEL_ENV);
    console.log(
      "[generate-scripts] NEXT_PUBLIC_APP_ENV:",
      process.env.NEXT_PUBLIC_APP_ENV,
    );
    console.log(
      "[generate-scripts] BETTER_AUTH_SECRET present:",
      !!process.env.BETTER_AUTH_SECRET,
    );
    console.log(
      "[generate-scripts] OPENAI_API_KEY present:",
      !!process.env.OPENAI_API_KEY,
    );
    console.log(
      "[generate-scripts] OPENAI_API_KEY length:",
      process.env.OPENAI_API_KEY?.length || 0,
    );
    console.log(
      "[generate-scripts] CEREBRAS_API_KEY present:",
      !!process.env.CEREBRAS_API_KEY,
    );
    console.log(
      "[generate-scripts] CEREBRAS_API_KEY length:",
      process.env.CEREBRAS_API_KEY?.length || 0,
    );
    console.log(
      "[generate-scripts] FAL_API_KEY present:",
      !!process.env.FAL_API_KEY,
    );

    const session = await auth.api.getSession({
      headers: await headers(),
    });
    console.log("[generate-scripts] Auth session:", {
      hasUser: !!session?.user,
      userId: session?.user?.id,
    });

    if (!session?.user?.id) {
      console.log("[generate-scripts] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    console.log("[generate-scripts] Request body:", {
      hasProductName: !!body.productName,
      hasProductDescription: !!body.productDescription,
      hasTargetAudience: !!body.targetAudience,
      variationCount: body.variationCount,
    });

    if (!body.productName || !body.productDescription || !body.targetAudience) {
      console.log("[generate-scripts] Missing required fields:", {
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

    console.log("[generate-scripts] Creating script generation record");
    const generationId = nanoid();
    try {
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
      console.log(
        "[generate-scripts] Script generation record created:",
        generationId,
      );
    } catch (dbError) {
      console.error("[generate-scripts] Database error:", dbError);
      throw new Error("Failed to create script generation record");
    }

    console.log("[generate-scripts] Starting workflow");
    try {
      const workflowId = await workflowManager.createScriptGenerationWorkflow({
        ...scriptRequest,
        generationId,
      });
      console.log("[generate-scripts] Workflow created:", workflowId);

      return NextResponse.json({
        success: true,
        workflowId,
        generationId,
      });
    } catch (workflowError) {
      console.error("[generate-scripts] Workflow error:", workflowError);
      throw new Error("Failed to create workflow");
    }
  } catch (error) {
    console.error("[generate-scripts] Script generation error:", error);
    if (error instanceof Error) {
      console.error("[generate-scripts] Error details:", {
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
