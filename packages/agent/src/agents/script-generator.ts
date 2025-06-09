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
import { MODELS, getBestModelForTask, getLLMProvider } from "../lib/providers";
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
  execute: async ({ input }) => {
    const startTime = Date.now();
    console.log(`Starting script generation for product: ${input.productName}`);

    try {
      let model: Awaited<ReturnType<typeof getLLMProvider>>;
      try {
        model = await getLLMProvider("creative");
        console.log("Using LLM provider for generation");
      } catch (error) {
        console.error("Failed to initialize LLM provider:", error);
        throw new Error("LLM provider initialization failed");
      }

      const prompt = generateScriptPrompt(input);
      console.log("Generated prompt for script generation");
      console.log("Prompt:", prompt);

      let text: string;
      try {
        const response = await model.generateText({
          prompt,
          temperature: 0.8,
          maxTokens: 4000,
        });
        text = response.text;
        console.log("Successfully generated text from LLM");
        console.log("Generated text:", text);
      } catch (error) {
        console.error("LLM generation failed:", error);
        throw new Error("Failed to generate text from LLM");
      }

      let variations: ScriptVariation[];
      try {
        variations = parseGeneratedScripts(text, input.userId);
        console.log(
          `Successfully parsed ${variations.length} script variations`,
        );
        console.log("Parsed variations:", JSON.stringify(variations, null, 2));
      } catch (error) {
        console.error("Script parsing failed:", error);
        throw new Error("Failed to parse generated scripts");
      }

      const processingTime = Date.now() - startTime;
      console.log(`Script generation completed in ${processingTime}ms`);

      return {
        variations,
        processingTime,
        totalGenerated: variations.length,
      };
    } catch (error) {
      console.error("Script generation failed:", error);
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
  execute: async ({ input }) => {
    const model = await getLLMProvider("reasoning");

    const prompt = `${SCRIPT_ANALYSIS_PROMPT}

Script to analyze:
${input.script}

${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ""}
${input.platform ? `Primary Platform: ${input.platform}` : ""}

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
  execute: async ({ input }) => {
    const startTime = Date.now();
    const model = await getLLMProvider("creative");

    const prompt = `Create a ${input.requiredAttributes.platform} video script for ${input.productInfo.name}.

Product: ${input.productInfo.description}
Key Benefits: ${input.productInfo.benefits.join(", ")}

Required Attributes:
- Hook Style: ${input.requiredAttributes.hookStyle}
- Ad Category: ${input.requiredAttributes.adCategory}
- Platform: ${input.requiredAttributes.platform}

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
      title: `${input.requiredAttributes.adCategory} for ${input.requiredAttributes.platform}`,
      script: text,
      duration: 30, // Default duration
      attributes: {
        hookStyle: input.requiredAttributes.hookStyle,
        adCategory: input.requiredAttributes.adCategory,
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
      targetPlatforms: [input.requiredAttributes.platform],
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

  model: getLLMProvider("creative"),

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
  const scripts = generatedText
    .split(/Script \d+:/)
    .filter(
      (script) =>
        script.trim().length > 0 && !script.includes("<|header_end|>"),
    )
    .map((script) => {
      const lines = script.trim().split("\n");
      const title = lines[0].trim().replace(/^["']|["']$/g, "");
      const hookMatch = script.match(/Hook[^:]*:\s*([^\n]+)/);
      const mainContentMatch = script.match(/Main Content[^:]*:\s*([^\n]+)/);
      const ctaMatch = script.match(/Call-to-Action[^:]*:\s*([^\n]+)/);
      const hookStyleMatch = script.match(/Hook Style:\s*\*\*([^*]+)\*\*/);
      const adCategoryMatch = script.match(/Ad Category:\s*\*\*([^*]+)\*\*/);
      const copywritingToneMatch = script.match(
        /Copywriting Tone:\s*\*\*([^*]+)\*\*/,
      );
      const visualStyleMatch = script.match(/Visual Style:\s*\*\*([^*]+)\*\*/);
      const problemSolutionMatch = script.match(
        /Problem-Solution:\s*\*\*([^*]+)\*\*/,
      );
      const pacingStyleMatch = script.match(/Pacing Style:\s*\*\*([^*]+)\*\*/);
      const ctaApproachMatch = script.match(/CTA Approach:\s*\*\*([^*]+)\*\*/);
      const durationMatch = script.match(/Duration:\s*(\d+)/);
      const platformsMatch = script.match(/Best Platforms:\s*([^\n]+)/);

      const attributes = {
        hookStyle: (hookStyleMatch?.[1].trim() as any) || "bold_statement",
        adCategory: (adCategoryMatch?.[1].trim() as any) || "product_demo",
        copywritingTone:
          (copywritingToneMatch?.[1].trim() as any) || "conversational_casual",
        visualStyle:
          (visualStyleMatch?.[1].trim() as any) || "quick_cuts_dynamic",
        problemSolutionFraming:
          (problemSolutionMatch?.[1].trim() as any) || "pain_point_focus",
        pacingStyle:
          (pacingStyleMatch?.[1].trim() as any) || "steady_build_30sec",
        ctaApproach:
          (ctaApproachMatch?.[1].trim() as any) || "soft_recommendation",
      };

      return {
        id: nanoid(),
        title: title || "Untitled Script",
        script: script.trim(),
        duration: durationMatch ? Number.parseInt(durationMatch[1]) : 30,
        attributes,
        hook: hookMatch?.[1].trim() || "Hook content",
        mainContent: mainContentMatch?.[1].trim() || "Main content",
        callToAction: ctaMatch?.[1].trim() || "CTA content",
        estimatedEngagement: "medium",
        targetPlatforms: (platformsMatch?.[1]
          .trim()
          .split(",")
          .map((p) => p.trim().toLowerCase()) as any[]) || ["tiktok"],
        generatedAt: new Date(),
        processingTime: 1500,
      };
    });

  return scripts;
}
