import { nanoid } from "nanoid";
import type {
  ScriptGenerationRequest,
  ScriptGenerationResponse,
  ScriptVariation,
} from "../types/script.js";

export const defaultScriptRequest: ScriptGenerationRequest = {
  userId: "demo-user",
  productName: "AI Video Script Generator",
  productDescription:
    "An AI-powered tool that generates engaging video scripts for social media ads",
  targetAudience:
    "Digital marketers and content creators looking to create viral social media ads",
  keyBenefits: [
    "Saves hours of script writing time",
    "Generates multiple variations instantly",
    "Optimized for social media platforms",
    "Data-driven performance predictions",
  ],
  brandTone: "Professional yet approachable",
  variationCount: 3,
};

export const defaultScriptVariation: ScriptVariation = {
  id: nanoid(),
  title: "Quick Demo Script",
  script:
    "Hey creators! 👋 Tired of staring at a blank page? Our AI script generator creates viral-ready content in seconds. Just describe your product, and watch as it crafts multiple engaging variations. Perfect for TikTok, Reels, and Shorts. Try it now!",
  duration: 15,
  attributes: {
    hookStyle: "provocative_question",
    adCategory: "product_demo",
    copywritingTone: "conversational_casual",
    visualStyle: "quick_cuts_dynamic",
    problemSolutionFraming: "pain_point_focus",
    pacingStyle: "rapid_fire_15sec",
    ctaApproach: "soft_recommendation",
  },
  hook: "Hey creators! 👋 Tired of staring at a blank page?",
  mainContent:
    "Our AI script generator creates viral-ready content in seconds. Just describe your product, and watch as it crafts multiple engaging variations.",
  callToAction: "Try it now!",
  estimatedEngagement: "high",
  targetPlatforms: ["tiktok", "instagram_reels", "youtube_shorts"],
  generatedAt: new Date(),
  processingTime: 1500,
};

export const defaultScriptResponse: ScriptGenerationResponse = {
  id: "default",
  userId: "default",
  status: "completed",
  variations: [],
  retryCount: 0,
  request: defaultScriptRequest,
  generatedAt: new Date(),
  totalProcessingTime: 0,
};
