import { Agent } from "@mastra/core/agent";
import { createTool } from "@mastra/core/tools";
import { nanoid } from "nanoid";
import { z } from "zod";
import {
  PERFORMANCE_PREDICTION_PROMPT,
  SCRIPT_ANALYSIS_PROMPT,
  SCRIPT_GENERATION_SYSTEM_PROMPT,
  generateScriptPrompt,
} from "../lib/prompts";
import {
  MODELS,
  cerebrasProvider,
  getBestModelForTask,
} from "../lib/providers";
import {
  type ScriptAttributes,
  type ScriptGenerationRequest,
  ScriptGenerationRequestSchema,
  type ScriptVariation,
  ScriptVariationSchema,
} from "../types/script";

// Tool for generating script variations
export const generateScriptVariationsTool = createTool({
  id: "generate-script-variations",
  description:
    "Generate multiple video script variations based on product information and requirements",
  inputSchema: ScriptGenerationRequestSchema,
  outputSchema: z.object({
    variations: z.array(ScriptVariationSchema),
    processingTime: z.number(),
    totalGenerated: z.number(),
  }),
  execute: async ({ context }) => {
    const startTime = Date.now();
    const request = context as ScriptGenerationRequest;

    try {
      // Use Cerebras for fast script generation
      const model = cerebrasProvider(getBestModelForTask("creative"));

      const prompt = generateScriptPrompt(request);

      // Generate scripts using AI
      const { text } = await model.generateText({
        prompt,
        temperature: 0.8,
        maxTokens: 4000,
      });

      // Parse the generated scripts (this would need custom parsing logic)
      const variations = parseGeneratedScripts(text, request.userId);

      const processingTime = Date.now() - startTime;

      return {
        variations,
        processingTime,
        totalGenerated: variations.length,
      };
    } catch (error) {
      throw new Error(
        `Failed to generate scripts: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  },
});

// Tool for analyzing script performance
export const analyzeScriptTool = createTool({
  id: "analyze-script",
  description:
    "Analyze a video script for effectiveness and provide improvement suggestions",
  inputSchema: z.object({
    script: z.string(),
    targetAudience: z.string().optional(),
    platform: z
      .enum(["tiktok", "instagram_reels", "youtube_shorts"])
      .optional(),
  }),
  outputSchema: z.object({
    analysis: z.string(),
    scores: z.object({
      hookEffectiveness: z.number(),
      contentStructure: z.number(),
      platformOptimization: z.number(),
      conversionPotential: z.number(),
    }),
    suggestions: z.array(z.string()),
  }),
  execute: async ({ context }) => {
    const model = cerebrasProvider(getBestModelForTask("reasoning"));

    const prompt = `${SCRIPT_ANALYSIS_PROMPT}

Script to analyze:
${context.script}

${context.targetAudience ? `Target Audience: ${context.targetAudience}` : ""}
${context.platform ? `Primary Platform: ${context.platform}` : ""}

Provide detailed analysis and actionable feedback.`;

    const { text } = await model.generateText({
      prompt,
      temperature: 0.3,
      maxTokens: 2000,
    });

    // Parse analysis results (simplified for demo)
    return {
      analysis: text,
      scores: {
        hookEffectiveness: 7.5,
        contentStructure: 8.0,
        platformOptimization: 7.0,
        conversionPotential: 7.8,
      },
      suggestions: [
        "Strengthen the opening hook with a more specific pain point",
        "Add social proof elements in the middle section",
        "Make the call-to-action more urgent and specific",
      ],
    };
  },
});

// Tool for attribute-based script generation
export const generateAttributeBasedScriptTool = createTool({
  id: "generate-attribute-based-script",
  description:
    "Generate a script variation with specific attribute constraints",
  inputSchema: z.object({
    productInfo: z.object({
      name: z.string(),
      description: z.string(),
      benefits: z.array(z.string()),
    }),
    requiredAttributes: z.object({
      hookStyle: z.enum([
        "bold_statement",
        "provocative_question",
        "problem_snapshot",
        "startling_visual",
      ]),
      adCategory: z.enum([
        "product_demo",
        "tutorial",
        "customer_testimonial",
        "ugc_style",
        "before_after_transformation",
        "storytelling_narrative",
      ]),
      platform: z.enum(["tiktok", "instagram_reels", "youtube_shorts"]),
    }),
    userId: z.string(),
  }),
  outputSchema: ScriptVariationSchema,
  execute: async ({ context }) => {
    const startTime = Date.now();
    const model = cerebrasProvider(getBestModelForTask("creative"));

    const prompt = `Create a ${context.requiredAttributes.platform} video script for ${context.productInfo.name}.

Product: ${context.productInfo.description}
Key Benefits: ${context.productInfo.benefits.join(", ")}

Required Attributes:
- Hook Style: ${context.requiredAttributes.hookStyle}
- Ad Category: ${context.requiredAttributes.adCategory}
- Platform: ${context.requiredAttributes.platform}

Generate a single, high-quality script that perfectly matches these requirements.`;

    const { text } = await model.generateText({
      prompt,
      temperature: 0.7,
      maxTokens: 1500,
    });

    const processingTime = Date.now() - startTime;

    // Create script variation object
    return {
      id: nanoid(),
      title: `${context.requiredAttributes.adCategory} for ${context.requiredAttributes.platform}`,
      script: text,
      duration: 30, // Default duration
      attributes: {
        hookStyle: context.requiredAttributes.hookStyle,
        adCategory: context.requiredAttributes.adCategory,
        copywritingTone: "conversational_casual" as const,
        visualStyle: "quick_cuts_dynamic" as const,
        problemSolutionFraming: "pain_point_focus" as const,
        pacingStyle: "steady_build_30sec" as const,
        ctaApproach: "soft_recommendation" as const,
      },
      hook: "Generated hook",
      mainContent: "Generated main content",
      callToAction: "Generated CTA",
      estimatedEngagement: "medium" as const,
      targetPlatforms: [context.requiredAttributes.platform],
      generatedAt: new Date(),
      processingTime,
    };
  },
});

// Main Script Generator Agent
export const scriptGeneratorAgent = new Agent({
  name: "Script Generator Agent",
  instructions: `${SCRIPT_GENERATION_SYSTEM_PROMPT}

You are a specialized AI agent for generating high-converting short-form video ad scripts. Your capabilities include:

1. **Bulk Script Generation**: Create up to 12 diverse script variations for any product
2. **Attribute-Based Creation**: Generate scripts with specific creative attributes and constraints  
3. **Performance Analysis**: Analyze existing scripts and provide improvement recommendations
4. **Platform Optimization**: Tailor scripts for TikTok, Instagram Reels, or YouTube Shorts

Always use the provided tools to generate and analyze scripts. Focus on creating authentic, engaging content that drives conversions while feeling native to each platform.

When generating scripts:
- Prioritize diverse approaches across the 7 key attributes
- Ensure each variation feels distinctly different 
- Include specific visual and editing guidance
- Predict performance potential for each script
- Optimize for the target platform's unique characteristics

Maintain a professional but creative tone, and always provide actionable insights.`,

  model: cerebrasProvider(getBestModelForTask("creative")),

  tools: {
    generateScriptVariations: generateScriptVariationsTool,
    analyzeScript: analyzeScriptTool,
    generateAttributeBasedScript: generateAttributeBasedScriptTool,
  },
});

// Helper function to parse generated scripts (simplified implementation)
function parseGeneratedScripts(
  generatedText: string,
  userId: string,
): ScriptVariation[] {
  // This is a simplified parser - in production, you'd want more robust parsing
  const scripts = generatedText
    .split("---")
    .filter((script) => script.trim().length > 0);

  return scripts.slice(0, 12).map((script, index) => ({
    id: nanoid(),
    title: `Script Variation ${index + 1}`,
    script: script.trim(),
    duration: 25 + Math.floor(Math.random() * 20), // Random duration 25-45 seconds
    attributes: {
      hookStyle: "bold_statement" as const,
      adCategory: "product_demo" as const,
      copywritingTone: "conversational_casual" as const,
      visualStyle: "quick_cuts_dynamic" as const,
      problemSolutionFraming: "pain_point_focus" as const,
      pacingStyle: "steady_build_30sec" as const,
      ctaApproach: "soft_recommendation" as const,
    },
    hook: "Hook content",
    mainContent: "Main content",
    callToAction: "CTA content",
    estimatedEngagement: "medium" as const,
    targetPlatforms: ["tiktok" as const],
    generatedAt: new Date(),
    processingTime: 1500,
  }));
}
