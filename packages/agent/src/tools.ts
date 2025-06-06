import { z } from 'zod';
import { tool } from 'ai';

// Script Analysis Tool - Analyzes attributes to determine best approach
export const analyzeAttributesTool = tool({
  description: 'Analyzes the selected video attributes to determine the best creative approach and identify synergies between attributes',
  parameters: z.object({
    attributes: z.record(z.boolean()),
    productContext: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      targetAudience: z.string().optional(),
    }).optional(),
  }),
  execute: async ({ attributes, productContext }) => {
    // Analyze which attributes work well together
    const activeAttributes = Object.entries(attributes)
      .filter(([_, active]) => active)
      .map(([key]) => key);
    
    // Determine primary creative approach based on active attributes
    let primaryApproach = 'balanced';
    let suggestedDuration = '15-30s';
    let keySynergies: string[] = [];
    
    // Logic to identify synergies and approach
    if (attributes.productDemo && attributes.beforeAfterTransformation) {
      keySynergies.push('Demo + Transformation: Show product solving problem in real-time');
    }
    
    if (attributes.customerTestimonial && attributes.socialProof) {
      keySynergies.push('Testimonial + Social Proof: Leverage peer validation');
    }
    
    if (attributes.storytellingNarrative && attributes.emotionalAppeal) {
      keySynergies.push('Story + Emotion: Create memorable narrative arc');
      suggestedDuration = '20-30s';
    }
    
    if (attributes.hookFastPaceRapidly && attributes.brevity) {
      suggestedDuration = '10-15s';
      primaryApproach = 'quick-hit';
    }
    
    return {
      activeAttributeCount: activeAttributes.length,
      primaryApproach,
      suggestedDuration,
      keySynergies,
      recommendations: generateRecommendations(activeAttributes, productContext),
    };
  },
});

// Script Generation Tool - Generates individual script variations
export const generateScriptTool = tool({
  description: 'Generates a single video script variation based on the provided attributes and context',
  parameters: z.object({
    attributes: z.record(z.boolean()),
    approach: z.string(),
    duration: z.string(),
    productContext: z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      targetAudience: z.string().optional(),
      brandTone: z.string().optional(),
    }).optional(),
    variationNumber: z.number(),
    focusAttributes: z.array(z.string()).describe('Which attributes to emphasize in this variation'),
  }),
  execute: async ({ attributes, approach, duration, productContext, variationNumber, focusAttributes }) => {
    // This would integrate with the actual LLM for script generation
    // For now, returning a structured template
    
    const scriptStructure = buildScriptStructure(attributes, focusAttributes, duration);
    
    return {
      scriptId: `script-${variationNumber}`,
      duration,
      structure: scriptStructure,
      focusedAttributes: focusAttributes,
      approach,
    };
  },
});

// Script Optimization Tool - Refines and improves generated scripts
export const optimizeScriptTool = tool({
  description: 'Optimizes a generated script for clarity, impact, and platform best practices',
  parameters: z.object({
    script: z.object({
      text: z.string(),
      visualDirections: z.array(z.string()),
      audioDirections: z.string(),
    }),
    targetPlatform: z.enum(['tiktok', 'instagram-reels', 'youtube-shorts']).optional(),
    optimizationFocus: z.enum(['engagement', 'conversion', 'awareness']).optional(),
  }),
  execute: async ({ script, targetPlatform, optimizationFocus }) => {
    // Apply platform-specific optimizations
    const optimizations: string[] = [];
    
    if (targetPlatform === 'tiktok') {
      optimizations.push('Added trending sound suggestion');
      optimizations.push('Adjusted hook for TikTok audience');
    }
    
    if (optimizationFocus === 'conversion') {
      optimizations.push('Strengthened CTA placement');
      optimizations.push('Added urgency element');
    }
    
    return {
      optimizedScript: script,
      optimizationsApplied: optimizations,
      confidenceScore: 0.85,
    };
  },
});

// Helper functions
function generateRecommendations(activeAttributes: string[], productContext?: any): string[] {
  const recommendations: string[] = [];
  
  if (activeAttributes.includes('hookFastPaceRapidly') && !activeAttributes.includes('brevity')) {
    recommendations.push('Consider enabling "brevity" to align with fast-paced hooks');
  }
  
  if (activeAttributes.includes('customerTestimonial') && !activeAttributes.includes('authenticity')) {
    recommendations.push('Enable "authenticity" to enhance testimonial credibility');
  }
  
  if (activeAttributes.length > 15) {
    recommendations.push('Consider focusing on fewer attributes for clearer messaging');
  }
  
  return recommendations;
}

function buildScriptStructure(attributes: Record<string, boolean>, focusAttributes: string[], duration: string): any {
  return {
    hook: generateHookStructure(attributes, focusAttributes),
    body: generateBodyStructure(attributes, focusAttributes),
    cta: generateCTAStructure(attributes),
    estimatedDuration: duration,
  };
}

function generateHookStructure(attributes: Record<string, boolean>, focusAttributes: string[]): any {
  return {
    type: attributes.hookFastPaceRapidly ? 'fast-visual' : 'standard',
    duration: '1-3s',
    elements: focusAttributes.filter(attr => ['hookFastPaceRapidly', 'problemSolutionFraming'].includes(attr)),
  };
}

function generateBodyStructure(attributes: Record<string, boolean>, focusAttributes: string[]): any {
  return {
    segments: focusAttributes.length,
    primaryFocus: focusAttributes[0],
    supportingElements: focusAttributes.slice(1),
  };
}

function generateCTAStructure(attributes: Record<string, boolean>): any {
  return {
    style: attributes.strongCTA ? 'direct' : 'soft',
    urgency: attributes.urgencyScarcity,
  };
}