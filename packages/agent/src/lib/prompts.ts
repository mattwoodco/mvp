import type {
  ScriptAttributes,
  ScriptGenerationRequest,
} from "../types/script";

export const SCRIPT_GENERATION_SYSTEM_PROMPT = `You are an expert short-form video ad script writer specializing in high-converting TikTok, Instagram Reels, and YouTube Shorts content.

Your task is to generate diverse, high-performing video script variations based on proven ad formats and winning creative strategies from 2025's top-performing campaigns.

## Core Principles:
1. **Hook Fast, Pace Rapidly**: Grab attention within the first 1-3 seconds
2. **Conversational, Impactful Copy**: Use casual, direct, authentic tone like peer-to-peer communication  
3. **Dynamic Visual & Editing Style**: Design for vertical format with quick cuts and text overlays
4. **Relatable Framing**: Use problem/solution or lifestyle integration approaches
5. **Strong, Clear CTAs**: Include subtle but effective calls-to-action

## Winning Ad Categories:
- Product Demonstration & Tutorial Ads
- Customer Testimonial & UGC-Style Ads  
- Before-and-After Transformation Ads
- Storytelling & Narrative-Driven Ads

## Script Structure:
Each script should have:
- **Hook** (1-3 seconds): Attention-grabbing opening
- **Main Content** (15-45 seconds): Core message with product showcase
- **Call-to-Action** (3-5 seconds): Clear next step for viewers

## Platform Optimization:
- TikTok: Native, trend-aligned, entertaining
- Instagram Reels: Aesthetic, aspirational, lifestyle-focused
- YouTube Shorts: Educational, value-driven, searchable

Generate scripts that feel authentic, platform-native, and conversion-focused while avoiding overly salesy language.`;

export function generateScriptPrompt(request: ScriptGenerationRequest): string {
  const {
    productName,
    productDescription,
    targetAudience,
    keyBenefits,
    brandTone,
    competitorInfo,
    customPrompt,
  } = request;

  return `Create ${request.variationCount} distinct video script variations for the following product:

## Product Information:
- **Name**: ${productName}
- **Description**: ${productDescription}
- **Target Audience**: ${targetAudience}
- **Key Benefits**: ${keyBenefits.join(", ")}
${brandTone ? `- **Brand Tone**: ${brandTone}` : ""}
${competitorInfo ? `- **Competitive Context**: ${competitorInfo}` : ""}
${customPrompt ? `- **Additional Requirements**: ${customPrompt}` : ""}

## Instructions:
1. Generate ${request.variationCount} completely different script approaches
2. Use diverse hook styles, ad categories, and visual approaches
3. Vary the duration between 15-45 seconds for each script
4. Ensure each script has distinct attributes and feels fresh
5. Include specific visual cues and editing suggestions
6. Make each script feel platform-native and conversion-focused

## Required Output Format:
For each script variation, provide:

**Script [Number]: [Creative Title]**

**Hook** (1-3 seconds):
[Attention-grabbing opening line/scene]

**Main Content** (15-40 seconds):
[Core message with clear structure]

**Call-to-Action** (3-5 seconds):
[Clear next step]

**Attributes:**
- Hook Style: [bold_statement/provocative_question/problem_snapshot/startling_visual]
- Ad Category: [product_demo/tutorial/customer_testimonial/ugc_style/before_after_transformation/storytelling_narrative]
- Copywriting Tone: [conversational_casual/direct_authentic/peer_to_peer/empathetic_relatable]
- Visual Style: [quick_cuts_dynamic/split_screen_comparison/text_overlay_heavy/ugc_handheld_style/transformation_reveal]
- Problem/Solution Framing: [pain_point_focus/lifestyle_aspiration/social_proof_validation/trend_alignment]
- Pacing Style: [rapid_fire_15sec/steady_build_30sec/story_arc_45sec]
- CTA Approach: [soft_recommendation/urgent_scarcity/social_proof_driven/embedded_natural]

**Duration**: [X seconds]
**Best Platforms**: [tiktok/instagram_reels/youtube_shorts]
**Visual Notes**: [Specific filming and editing suggestions]

---

Focus on creating scripts that would genuinely perform well in the current social media landscape.`;
}

export function generateAttributeVariationPrompt(
  baseAttributes: Partial<ScriptAttributes>,
): string {
  return `Create a script variation that maintains these core attributes while exploring creative alternatives:

## Base Attributes to Maintain:
${Object.entries(baseAttributes)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

## Creative Challenge:
While keeping the above attributes consistent, create a fresh approach that:
1. Uses different storytelling techniques
2. Explores alternative visual concepts
3. Experiments with different emotional triggers
4. Tests various social proof elements
5. Tries unique call-to-action integrations

Focus on maximizing engagement while staying true to the specified attribute constraints.`;
}

export const SCRIPT_ANALYSIS_PROMPT = `Analyze the following video script and provide detailed insights:

## Script Analysis Framework:

### 1. Hook Effectiveness (1-10)
- Attention-grabbing power
- Relevance to target audience
- Scroll-stopping potential

### 2. Content Structure (1-10)
- Logical flow and pacing
- Value proposition clarity
- Problem/solution alignment

### 3. Platform Optimization (1-10)
- Platform-native feel
- Visual storytelling potential
- Format appropriateness

### 4. Conversion Potential (1-10)
- Call-to-action strength
- Trust-building elements
- Purchase intent drivers

### 5. Engagement Predictors
- Shareability factors
- Comment-bait elements
- Watch-time optimization

### 6. Improvement Suggestions
- Specific enhancement recommendations
- Alternative approaches to consider
- Platform-specific optimizations

Provide actionable insights that could improve script performance.`;

export const PERFORMANCE_PREDICTION_PROMPT = `Based on current short-form video trends and performance data, predict the potential success of this script:

## Performance Metrics to Predict:
1. **Engagement Rate** (Low/Medium/High)
2. **Completion Rate** (% who watch to end)
3. **Click-Through Rate** (% who take action)
4. **Share Likelihood** (Low/Medium/High)
5. **Platform Preference** (Which platform would perform best)

## Analysis Factors:
- Hook strength and timing
- Content value and entertainment
- Visual storytelling potential
- Call-to-action effectiveness
- Trend alignment
- Target audience fit

Provide realistic performance expectations with reasoning for each prediction.`;
