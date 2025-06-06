import { NextRequest } from "next/server";
import { validateRequest } from "@mvp/auth";
import { VideoScriptDatabaseService } from "@mvp/agent";

export async function GET(request: NextRequest) {
  const { user } = await validateRequest();
  
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const dbService = new VideoScriptDatabaseService();
  const templates = await dbService.getUserTemplates(user.id);
  
  return Response.json({ templates });
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await validateRequest();
    
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { name, description, generationId } = body;

    if (!name || !generationId) {
      return new Response("Missing required fields", { status: 400 });
    }

    const dbService = new VideoScriptDatabaseService();
    
    // Get the generation to extract attributes
    const generation = await dbService.getGeneration(generationId);
    
    if (!generation || generation.userId !== user.id) {
      return new Response("Generation not found", { status: 404 });
    }

    // Save template with attributes from the generation
    const templateId = await dbService.saveTemplate(
      user.id,
      name,
      description,
      generation.attributes
    );

    return Response.json({ templateId });
  } catch (error) {
    console.error("Template save error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}