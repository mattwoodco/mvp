import { NextRequest } from "next/server";
import { validateRequest } from "@mvp/auth";
import { VideoScriptDatabaseService } from "@mvp/agent";

export async function GET(
  request: NextRequest,
  { params }: { params: { generationId: string } }
) {
  const { user } = await validateRequest();
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { generationId } = params;
  const dbService = new VideoScriptDatabaseService();

  // Set up SSE
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let lastStatus = "";
      let attempts = 0;
      const maxAttempts = 600; // 10 minutes max

      const checkProgress = async () => {
        try {
          const generation = await dbService.getGeneration(generationId);
          
          if (!generation || generation.userId !== user.id) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: "error", message: "Generation not found" })}\n\n`)
            );
            controller.close();
            return;
          }

          // Send progress update if status changed
          if (generation.status !== lastStatus || generation.status === "processing") {
            lastStatus = generation.status;
            
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: "progress",
                progress: {
                  stage: mapStatusToStage(generation.status),
                  currentScript: Math.floor((generation.progress || 0) / 100 * 12), // Estimate based on progress
                  totalScripts: 12,
                  message: getStatusMessage(generation.status, generation.progress || 0),
                  timestamp: Date.now(),
                },
              })}\n\n`)
            );
          }

          // Check if complete
          if (generation.status === "completed") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: "complete",
                scripts: generation.scripts,
              })}\n\n`)
            );
            controller.close();
            return;
          }

          // Check if failed
          if (generation.status === "failed") {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: "error",
                message: generation.error || "Generation failed",
              })}\n\n`)
            );
            controller.close();
            return;
          }

          // Continue checking
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkProgress, 1000); // Check every second
          } else {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: "error",
                message: "Generation timeout",
              })}\n\n`)
            );
            controller.close();
          }
        } catch (error) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: "error",
              message: "Internal error",
            })}\n\n`)
          );
          controller.close();
        }
      };

      // Start checking
      checkProgress();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

function mapStatusToStage(status: string): string {
  switch (status) {
    case "pending":
      return "initializing";
    case "processing":
      return "generating"; // Simplified - could be more granular
    case "completed":
      return "finalizing";
    default:
      return "initializing";
  }
}

function getStatusMessage(status: string, progress: number): string {
  switch (status) {
    case "pending":
      return "Initializing script generation...";
    case "processing":
      if (progress < 10) return "Analyzing attributes and planning approach...";
      if (progress < 80) return `Generating script variations...`;
      if (progress < 90) return "Optimizing scripts for maximum impact...";
      return "Finalizing script variations...";
    case "completed":
      return "Scripts generated successfully!";
    case "failed":
      return "Script generation failed";
    default:
      return "Processing...";
  }
}