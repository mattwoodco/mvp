import { NextRequest } from "next/server";
import { validateRequest } from "@mvp/auth";
import { 
  VideoScriptAgent, 
  VideoScriptDatabaseService,
  ScriptGenerationRequestSchema 
} from "@mvp/agent";

export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const validatedData = ScriptGenerationRequestSchema.parse(body);

    // Create database record
    const dbService = new VideoScriptDatabaseService();
    const generationId = await dbService.createGeneration(user.id, validatedData);

    // Start generation in background
    generateInBackground(generationId, user.id, validatedData);

    return Response.json({ generationId });
  } catch (error) {
    console.error("Generation error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

async function generateInBackground(
  generationId: string,
  userId: string,
  request: any
) {
  const dbService = new VideoScriptDatabaseService();
  const startTime = Date.now();

  try {
    await dbService.updateGenerationProgress(generationId, 0, "processing");

    const agent = new VideoScriptAgent({
      onProgress: async (progress) => {
        const percentComplete = progress.stage === "analyzing" ? 10 :
                              progress.stage === "generating" ? 10 + (progress.currentScript / progress.totalScripts) * 70 :
                              progress.stage === "optimizing" ? 80 :
                              90;
        
        await dbService.updateGenerationProgress(
          generationId,
          percentComplete,
          "processing"
        );
      },
    });

    const scripts = await agent.generateScripts(request);
    
    const endTime = Date.now();
    const processingTimeMs = endTime - startTime;
    
    // Estimate tokens (placeholder - would need actual token counting)
    const estimatedTokens = scripts.length * 500;

    await dbService.completeGeneration(
      generationId,
      scripts,
      estimatedTokens,
      processingTimeMs
    );
  } catch (error) {
    console.error("Background generation error:", error);
    await dbService.failGeneration(
      generationId,
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}