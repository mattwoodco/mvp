// Export types
export type * from "./types/script";

// Export providers and models
export {
  cerebrasClient,
  cerebrasProvider,
  getBestModelForTask,
  getOpenAIProvider,
  MODEL_CHARACTERISTICS,
  MODELS,
} from "./lib/providers";

// Export prompts
export {
  generateAttributeVariationPrompt,
  generateScriptPrompt,
  PERFORMANCE_PREDICTION_PROMPT,
  SCRIPT_ANALYSIS_PROMPT,
  SCRIPT_GENERATION_SYSTEM_PROMPT,
} from "./lib/prompts";

// Export agents and tools
export {
  analyzeScriptTool,
  generateAttributeBasedScriptTool,
  generateScriptVariationsTool,
  scriptGeneratorAgent,
} from "./agents/script-generator";

// Export workflow management
export {
  WorkflowManager,
  workflowManager,
  type WorkflowEdge,
  type WorkflowNode,
  type WorkflowProgress,
} from "./lib/workflow-manager";

// Export schemas for validation
export {
  AgentStepSchema,
  AgentWorkflowSchema,
  ScriptAttributesSchema,
  ScriptGenerationRequestSchema,
  ScriptGenerationResponseSchema,
  ScriptVariationSchema,
} from "./types/script";
