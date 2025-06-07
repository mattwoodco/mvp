import { LLMProviderFactory } from "../llm/providers";
import {
  type VideoScriptAttributes,
  VideoScriptAttributesSchema,
} from "../types";
import type { LLMConfig } from "../types";
import {
  BaseTool,
  type ToolContext,
  type ToolResult,
  createToolParameter,
  registerTool,
} from "./base";

/**
 * Tool for analyzing script attributes and generating recommendations
 */
export class ScriptAttributeAnalyzer extends BaseTool {
  readonly id = "script_attribute_analyzer";
  readonly name = "Script Attribute Analyzer";
  readonly description =
    "Analyzes video script requirements and recommends optimal attributes based on goals, target audience, and platform";
  readonly category = "analysis" as const;
  readonly parameters = [
    createToolParameter({
      name: "productType",
      type: "string",
      description: "Type of product or service being advertised",
      required: true,
    }),
    createToolParameter({
      name: "targetAudience",
      type: "string",
      description: "Primary target audience demographics and psychographics",
      required: true,
    }),
    createToolParameter({
      name: "platform",
      type: "string",
      description: "Target platform for the video",
      required: true,
      enum: ["tiktok", "instagram_reels", "youtube_shorts", "cross_platform"],
    }),
    createToolParameter({
      name: "campaignGoals",
      type: "array",
      description:
        "List of campaign objectives (awareness, conversion, engagement, etc.)",
      required: true,
    }),
    createToolParameter({
      name: "competitorAnalysis",
      type: "string",
      description: "Brief analysis of competitor video strategies",
      required: false,
    }),
    createToolParameter({
      name: "brandVoice",
      type: "string",
      description: "Brand voice and personality guidelines",
      required: false,
    }),
  ];

  async execute(
    params: Record<string, any>,
    context: ToolContext,
  ): Promise<ToolResult> {
    try {
      const {
        productType,
        targetAudience,
        platform,
        campaignGoals,
        competitorAnalysis,
        brandVoice,
      } = params;

      // Create analysis prompt based on research insights
      const analysisPrompt = `
Based on the latest research on high-performing short-form video ads, analyze the following requirements and recommend optimal script attributes:

Product Type: ${productType}
Target Audience: ${targetAudience}
Platform: ${platform}
Campaign Goals: ${Array.isArray(campaignGoals) ? campaignGoals.join(", ") : campaignGoals}
${competitorAnalysis ? `Competitor Analysis: ${competitorAnalysis}` : ""}
${brandVoice ? `Brand Voice: ${brandVoice}` : ""}

Based on research showing that:
- Hook Fast, Pace Rapidly: 65% boost in completion rates with strong 1-3s hooks
- Platform-specific optimization: TikTok users prefer authentic, casual content
- Successful formats: Product demos, UGC testimonials, before/after, and narrative stories
- Visual elements: Jump cuts, text overlays increase engagement by 16%
- Audio strategy: Trending audio crucial for platform algorithm favor

Provide recommendations for each of the 24 script attributes:
1. Format (product_demo, testimonial_ugc, before_after, narrative_story)
2. Duration (5-60 seconds)
3. Pacing (fast, medium, dynamic)
4. Hook Type (bold_statement, question, problem_snapshot, startling_fact)
5. Hook Timing (1-3 seconds)
6. Narrative Structure (problem_solution, lifestyle_integration, transformation, educational)
7. Conflict Type (relatable_pain, aspirational_gap, before_state, common_frustration)
8. Resolution (product_hero, lifestyle_benefit, dramatic_reveal, educational_insight)
9. Tone (conversational, casual, authentic, energetic, empathetic)
10. Voice Style (first_person, peer_to_peer, friendly_expert, relatable_storyteller)
11. Language (everyday, accessible, platform_native, trendy_slang)
12. Visual Style (jump_cuts, split_screen, before_after_comparison, step_by_step)
13. Scene Changes (2-8 for engagement)
14. Text Overlays (boolean)
15. CTA Placement (integrated_natural, soft_recommendation, end_focused, story_embedded)
16. CTA Type (link_in_bio, discount_code, try_now, learn_more)
17. Urgency (limited_time, scarcity, fomo, none)
18. Social Proof (testimonial, user_ratings, popularity_mention, trending_reference)
19. Credibility Element (real_person, before_after_proof, demonstration, expert_mention)
20. Platform optimization
21. Aspect Ratio (9:16, 1:1, 16:9)
22. Sound Strategy (trending_audio, custom_music, voice_over, ambient)
23. Interaction Prompt (question_to_audience, comment_encouragement, share_worthy_moment, duet_invitation)
24. Trend Alignment (viral_challenge, trending_format, seasonal_relevance, cultural_moment)
25. Shareability (quotable_moment, transformation_reveal, educational_value, entertainment)

Return as a JSON object with reasoning for each recommendation.
`;

      // Use LLM to analyze and recommend attributes
      const llmConfig: LLMConfig = {
        provider: "cerebras",
        model: "llama3.1-70b",
        apiKey: process.env.CEREBRAS_API_KEY || "",
        temperature: 0.3,
        maxTokens: 2000,
        topP: 1,
        retryAttempts: 3,
        timeout: 30000,
      };

      const provider = LLMProviderFactory.create(llmConfig);
      const response = await provider.complete([
        {
          role: "system",
          content:
            "You are an expert video marketing strategist specializing in short-form social media content.",
        },
        { role: "user", content: analysisPrompt },
      ]);

      // Parse the recommendations
      let recommendations: Partial<VideoScriptAttributes>;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          recommendations = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found in response");
        }
      } catch (parseError) {
        // Fallback: create structured recommendations from text
        recommendations = this.parseRecommendationsFromText(response.content);
      }

      return {
        success: true,
        data: {
          recommendations,
          analysis: response.content,
          confidence: this.calculateConfidenceScore(recommendations),
          metadata: {
            platform,
            productType,
            analysisDate: new Date().toISOString(),
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  private parseRecommendationsFromText(
    text: string,
  ): Partial<VideoScriptAttributes> {
    // Fallback parsing logic for when JSON extraction fails
    const recommendations: Partial<VideoScriptAttributes> = {};

    // Extract format
    if (text.includes("product_demo") || text.includes("demonstration")) {
      recommendations.format = "product_demo";
    } else if (text.includes("testimonial") || text.includes("ugc")) {
      recommendations.format = "testimonial_ugc";
    } else if (text.includes("before") && text.includes("after")) {
      recommendations.format = "before_after";
    } else {
      recommendations.format = "narrative_story";
    }

    // Extract other key attributes with smart defaults
    recommendations.duration = 30; // Default to 30 seconds
    recommendations.pacing = "fast"; // Research shows fast pacing performs better
    recommendations.hookType = "question"; // Questions are highly engaging
    recommendations.hookTiming = 2;
    recommendations.platform = "tiktok"; // Default platform

    return recommendations;
  }

  private calculateConfidenceScore(recommendations: any): number {
    // Calculate confidence based on completeness and research alignment
    const requiredFields = Object.keys(VideoScriptAttributesSchema.shape);
    const providedFields = Object.keys(recommendations);
    const completeness = providedFields.length / requiredFields.length;

    // Base confidence on completeness and known high-performing patterns
    return Math.min(0.95, 0.5 + completeness * 0.4 + 0.1);
  }
}

/**
 * Tool for generating script variations based on attributes
 */
export class ScriptVariationGenerator extends BaseTool {
  readonly id = "script_variation_generator";
  readonly name = "Script Variation Generator";
  readonly description =
    "Generates multiple script variations based on specified attributes and optimization goals";
  readonly category = "generation" as const;
  readonly parameters = [
    createToolParameter({
      name: "attributes",
      type: "object",
      description: "Script attributes object containing all 24 parameters",
      required: true,
    }),
    createToolParameter({
      name: "variationCount",
      type: "number",
      description: "Number of script variations to generate (1-12)",
      required: false,
      default: 3,
    }),
    createToolParameter({
      name: "optimizationFocus",
      type: "string",
      description: "Primary optimization goal",
      required: false,
      enum: ["engagement", "conversion", "reach", "brand_awareness"],
      default: "engagement",
    }),
    createToolParameter({
      name: "creativityLevel",
      type: "string",
      description: "How creative/experimental to be with variations",
      required: false,
      enum: ["conservative", "moderate", "experimental"],
      default: "moderate",
    }),
  ];

  async execute(
    params: Record<string, any>,
    context: ToolContext,
  ): Promise<ToolResult> {
    try {
      const {
        attributes,
        variationCount = 3,
        optimizationFocus = "engagement",
        creativityLevel = "moderate",
      } = params;

      // Validate attributes
      const validatedAttributes = VideoScriptAttributesSchema.parse(attributes);

      const variations: Array<{
        id: string;
        script: string;
        attributes: VideoScriptAttributes;
        rationale: string;
      }> = [];

      for (let i = 0; i < Math.min(variationCount, 12); i++) {
        const variationAttributes = this.createVariation(
          validatedAttributes,
          i,
          creativityLevel,
        );
        const script = await this.generateScript(
          variationAttributes,
          optimizationFocus,
        );

        variations.push({
          id: `variation_${i + 1}`,
          script: script.content,
          attributes: variationAttributes,
          rationale: script.rationale,
        });
      }

      return {
        success: true,
        data: {
          variations,
          baseAttributes: validatedAttributes,
          optimizationFocus,
          creativityLevel,
          generationDate: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Script generation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  private createVariation(
    base: VideoScriptAttributes,
    index: number,
    creativityLevel: string,
  ): VideoScriptAttributes {
    const variation = { ...base };

    // Apply systematic variations based on index and creativity level
    switch (creativityLevel) {
      case "conservative": {
        // Minor tweaks only
        if (index % 2 === 0) {
          variation.hookType =
            variation.hookType === "question" ? "bold_statement" : "question";
        }
        break;
      }

      case "moderate": {
        // Test different approaches
        const moderateVariations = [
          { hookType: "question" as const, tone: "conversational" as const },
          { hookType: "bold_statement" as const, tone: "energetic" as const },
          {
            hookType: "problem_snapshot" as const,
            tone: "empathetic" as const,
          },
        ];
        Object.assign(
          variation,
          moderateVariations[index % moderateVariations.length],
        );
        break;
      }

      case "experimental": {
        // Significant changes to test new approaches
        if (index === 0) {
          variation.format = "product_demo";
          variation.visualStyle = "step_by_step";
        } else if (index === 1) {
          variation.format = "testimonial_ugc";
          variation.voiceStyle = "peer_to_peer";
        } else {
          variation.format = "before_after";
          variation.visualStyle = "before_after_comparison";
        }
        break;
      }
    }

    return variation;
  }

  private async generateScript(
    attributes: VideoScriptAttributes,
    optimizationFocus: string,
  ): Promise<{ content: string; rationale: string }> {
    const prompt = this.createScriptPrompt(attributes, optimizationFocus);

    const llmConfig: LLMConfig = {
      provider: "cerebras",
      model: "llama3.1-70b",
      apiKey: process.env.CEREBRAS_API_KEY || "",
      temperature: 0.7,
      maxTokens: 1500,
      topP: 1,
      retryAttempts: 3,
      timeout: 30000,
    };

    const provider = LLMProviderFactory.create(llmConfig);
    const response = await provider.complete([
      {
        role: "system",
        content:
          "You are a world-class copywriter specializing in high-converting short-form video scripts.",
      },
      { role: "user", content: prompt },
    ]);

    // Extract script and rationale from response
    const sections = response.content.split("RATIONALE:");
    const script = sections[0].replace("SCRIPT:", "").trim();
    const rationale =
      sections[1]?.trim() ||
      "Generated based on research-backed best practices";

    return { content: script, rationale };
  }

  private createScriptPrompt(
    attributes: VideoScriptAttributes,
    optimizationFocus: string,
  ): string {
    return `
Create a ${attributes.duration}-second ${attributes.format} video script optimized for ${optimizationFocus} with these specifications:

ATTRIBUTES:
- Format: ${attributes.format}
- Duration: ${attributes.duration} seconds
- Platform: ${attributes.platform}
- Hook Type: ${attributes.hookType} (deliver in ${attributes.hookTiming} seconds)
- Tone: ${attributes.tone}
- Voice Style: ${attributes.voiceStyle}
- Narrative: ${attributes.narrativeStructure}
- Visual Style: ${attributes.visualStyle}
- CTA: ${attributes.ctaType} with ${attributes.ctaPlacement} placement
- Social Proof: ${attributes.socialProof}
- Urgency: ${attributes.urgency}

OPTIMIZATION FOCUS: ${optimizationFocus}

REQUIREMENTS:
1. Start with a powerful ${attributes.hookType} that grabs attention in ${attributes.hookTiming} seconds
2. Use ${attributes.tone} tone and ${attributes.voiceStyle} voice throughout
3. Include ${attributes.sceneChanges} scene changes for pacing
4. ${attributes.textOverlays ? "Include text overlay suggestions" : "Focus on verbal content"}
5. End with a ${attributes.ctaPlacement} call-to-action
6. Incorporate ${attributes.socialProof} elements
7. Maintain ${attributes.pacing} pacing throughout

FORMAT:
SCRIPT:
[Provide the complete script with timing markers and visual cues]

RATIONALE:
[Explain why this approach will be effective based on video marketing research]
`;
  }
}

/**
 * Tool for validating script quality against best practices
 */
export class ScriptQualityValidator extends BaseTool {
  readonly id = "script_quality_validator";
  readonly name = "Script Quality Validator";
  readonly description =
    "Validates script quality against research-backed best practices and provides improvement suggestions";
  readonly category = "validation" as const;
  readonly parameters = [
    createToolParameter({
      name: "script",
      type: "string",
      description: "The video script to validate",
      required: true,
    }),
    createToolParameter({
      name: "attributes",
      type: "object",
      description: "Script attributes for context",
      required: true,
    }),
    createToolParameter({
      name: "validationLevel",
      type: "string",
      description: "Depth of validation to perform",
      required: false,
      enum: ["basic", "comprehensive", "expert"],
      default: "comprehensive",
    }),
  ];

  async execute(
    params: Record<string, any>,
    context: ToolContext,
  ): Promise<ToolResult> {
    try {
      const { script, attributes, validationLevel = "comprehensive" } = params;

      const validatedAttributes = VideoScriptAttributesSchema.parse(attributes);
      const validation = await this.validateScript(
        script,
        validatedAttributes,
        validationLevel,
      );

      return {
        success: true,
        data: validation,
      };
    } catch (error) {
      return {
        success: false,
        error: `Validation failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }
  }

  private async validateScript(
    script: string,
    attributes: VideoScriptAttributes,
    level: string,
  ): Promise<any> {
    const validationPrompt = `
Validate this ${attributes.duration}-second ${attributes.platform} video script against research-backed best practices:

SCRIPT:
${script}

ATTRIBUTES:
${JSON.stringify(attributes, null, 2)}

VALIDATION CRITERIA (based on recent video marketing research):
1. Hook Effectiveness: Strong opening that grabs attention in 1-3 seconds
2. Pacing: Appropriate for platform (TikTok prefers fast, dynamic)
3. Engagement Elements: Questions, surprises, emotional triggers
4. Platform Optimization: Native feel for ${attributes.platform}
5. CTA Integration: Natural, non-pushy call-to-action
6. Visual Compatibility: Works with ${attributes.visualStyle}
7. Length Optimization: Ideal for ${attributes.duration}s format
8. Authenticity: Matches ${attributes.tone} tone
9. Shareability: Contains quotable or memorable moments
10. Conversion Potential: Likely to drive desired action

Provide:
- Overall Score (0-100)
- Detailed assessment for each criterion
- Specific improvement suggestions
- Strengths to maintain
- Risk factors to address

Use ${level} level of analysis.
`;

    const llmConfig: LLMConfig = {
      provider: "cerebras",
      model: "llama3.1-70b",
      apiKey: process.env.CEREBRAS_API_KEY || "",
      temperature: 0.3,
      maxTokens: 2000,
      topP: 1,
      retryAttempts: 3,
      timeout: 30000,
    };

    const provider = LLMProviderFactory.create(llmConfig);
    const response = await provider.complete([
      {
        role: "system",
        content:
          "You are an expert video script analyst with deep knowledge of social media best practices.",
      },
      { role: "user", content: validationPrompt },
    ]);

    return {
      content: response.content,
      timestamp: new Date().toISOString(),
      validationLevel: level,
      attributes,
    };
  }
}

// Register tools when module is loaded
registerTool(new ScriptAttributeAnalyzer());
registerTool(new ScriptVariationGenerator());
registerTool(new ScriptQualityValidator());
