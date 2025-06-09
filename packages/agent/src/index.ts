// Export types
export type * from "./types/script";

// Export providers and models
export {
  openaiProvider,
  cerebrasClient,
  cerebrasProvider,
  MODELS,
  MODEL_CHARACTERISTICS,
  getBestModelForTask,
} from "./lib/providers";

// Export prompts
export {
  SCRIPT_GENERATION_SYSTEM_PROMPT,
  generateScriptPrompt,
  generateAttributeVariationPrompt,
  SCRIPT_ANALYSIS_PROMPT,
  PERFORMANCE_PREDICTION_PROMPT,
} from "./lib/prompts";

// Export agents and tools
export {
  scriptGeneratorAgent,
  generateScriptVariationsTool,
  analyzeScriptTool,
  generateAttributeBasedScriptTool,
} from "./agents/script-generator";

// Export workflow management
export {
  WorkflowManager,
  workflowManager,
  type WorkflowNode,
  type WorkflowEdge,
  type WorkflowProgress,
} from "./lib/workflow-manager";

// Export schemas for validation
export {
  ScriptAttributesSchema,
  ScriptGenerationRequestSchema,
  ScriptVariationSchema,
  ScriptGenerationResponseSchema,
  AgentStepSchema,
  AgentWorkflowSchema,
} from "./types/script";
