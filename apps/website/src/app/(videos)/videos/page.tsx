import { VideoGenerationWorkflow } from "@mvp/workflow-generation";
import { generateVideo } from "./actions";

export default function VideosPage() {
  return (
    <div className="container mx-auto py-6">
      <VideoGenerationWorkflow onGenerate={generateVideo} />
    </div>
  );
}
