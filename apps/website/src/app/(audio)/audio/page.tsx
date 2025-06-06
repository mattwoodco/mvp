import { AudioGenerationWorkflow } from "@mvp/workflow-generation";
import { generateAudio } from "./actions";

export default function AudioPage() {
  return (
    <div className="container mx-auto py-6">
      <AudioGenerationWorkflow onGenerate={generateAudio} />
    </div>
  );
}