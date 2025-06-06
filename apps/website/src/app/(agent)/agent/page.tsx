import { Metadata } from "next";
import { redirect } from "next/navigation";
import { validateRequest } from "@mvp/auth";
import { VideoScriptGenerator } from "./video-script-generator";

export const metadata: Metadata = {
  title: "AI Video Script Generator",
  description: "Generate multiple video script variations using AI based on proven short-form video attributes",
};

export default async function AgentPage() {
  const { user, session } = await validateRequest();
  
  if (!user || !session) {
    redirect("/login?redirect=/agent");
  }
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Video Script Generator</h1>
          <p className="text-muted-foreground">
            Generate compelling short-form video scripts using AI. Select from 24 research-backed attributes
            to create multiple script variations tailored to your product and audience.
          </p>
        </div>
        
        <VideoScriptGenerator userId={user.id} />
      </div>
    </div>
  );
}