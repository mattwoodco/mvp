// Export types
export type * from "./types/script.js";

// Export providers and models
export {
  cerebrasClient,
  cerebrasProvider,
  getBestModelForTask,
  MODEL_CHARACTERISTICS,
  MODELS,
  openaiProvider,
} from "./lib/providers.js";

// Export prompts
export {
  generateAttributeVariationPrompt,
  generateScriptPrompt,
  PERFORMANCE_PREDICTION_PROMPT,
  SCRIPT_ANALYSIS_PROMPT,
  SCRIPT_GENERATION_SYSTEM_PROMPT,
} from "./lib/prompts.js";

// Export agents and tools
export {
  analyzeScriptTool,
  generateAttributeBasedScriptTool,
  generateScriptVariationsTool,
  scriptGeneratorAgent,
} from "./agents/script-generator.js";

// Export workflow management
export {
  WorkflowManager,
  workflowManager,
  type WorkflowEdge,
  type WorkflowNode,
  type WorkflowProgress,
} from "./lib/workflow-manager.js";

// Export schemas for validation
export {
  AgentStepSchema,
  AgentWorkflowSchema,
  ScriptAttributesSchema,
  ScriptGenerationRequestSchema,
  ScriptGenerationResponseSchema,
  ScriptVariationSchema,
} from "./types/script.js";
