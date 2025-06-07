"use client";

import { Button } from "@mvp/ui/button";
import { Input } from "@mvp/ui/input";
import type React from "react";
import { useState } from "react";

// Define the video script attributes types locally since we're having import issues
interface VideoScriptAttributes {
  format:
    | "product_demo"
    | "testimonial_ugc"
    | "before_after"
    | "narrative_story";
  duration: number;
  pacing: "fast" | "medium" | "dynamic";
  hookType:
    | "bold_statement"
    | "question"
    | "problem_snapshot"
    | "startling_fact";
  hookTiming: number;
  platform: "tiktok" | "instagram_reels" | "youtube_shorts" | "cross_platform";
  aspectRatio: "9:16" | "1:1" | "16:9";
  tone: "conversational" | "casual" | "authentic" | "energetic" | "empathetic";
}

interface ScriptGenerationFormProps {
  userId: string;
}

export function ScriptGenerationForm({ userId }: ScriptGenerationFormProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [attributes, setAttributes] = useState<Partial<VideoScriptAttributes>>({
    format: "product_demo",
    duration: 30,
    pacing: "medium",
    hookType: "bold_statement",
    hookTiming: 2,
    platform: "tiktok",
    aspectRatio: "9:16",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const response = await fetch("/api/agent/generate-script", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          attributes,
          variationCount: 3,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate script");
      }

      const result = await response.json();
      console.log("Script generation started:", result);

      alert(
        "Script generation started! Check the workflow dashboard for progress.",
      );
    } catch (error) {
      console.error("Error generating script:", error);
      alert("Failed to generate script. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const updateAttribute = <K extends keyof VideoScriptAttributes>(
    key: K,
    value: VideoScriptAttributes[K],
  ) => {
    setAttributes((prev: Partial<VideoScriptAttributes>) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Configuration */}
      <div>
        <h3 className="text-lg font-medium mb-3">Basic Configuration</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="format"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Format Type
            </label>
            <select
              id="format"
              value={attributes.format || "product_demo"}
              onChange={(e) =>
                updateAttribute(
                  "format",
                  e.target.value as VideoScriptAttributes["format"],
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="product_demo">Product Demo</option>
              <option value="testimonial_ugc">Testimonial UGC</option>
              <option value="before_after">Before/After</option>
              <option value="narrative_story">Narrative Story</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Duration (seconds)
            </label>
            <Input
              id="duration"
              type="number"
              min="5"
              max="60"
              value={attributes.duration || 30}
              onChange={(e) =>
                updateAttribute("duration", Number.parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>

          <div>
            <label
              htmlFor="platform"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Platform
            </label>
            <select
              id="platform"
              value={attributes.platform || "tiktok"}
              onChange={(e) =>
                updateAttribute(
                  "platform",
                  e.target.value as VideoScriptAttributes["platform"],
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="tiktok">TikTok</option>
              <option value="instagram_reels">Instagram Reels</option>
              <option value="youtube_shorts">YouTube Shorts</option>
              <option value="cross_platform">Cross Platform</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hook & Engagement */}
      <div>
        <h3 className="text-lg font-medium mb-3">Hook & Engagement</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="hookType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hook Type
            </label>
            <select
              id="hookType"
              value={attributes.hookType || "bold_statement"}
              onChange={(e) =>
                updateAttribute(
                  "hookType",
                  e.target.value as VideoScriptAttributes["hookType"],
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="bold_statement">Bold Statement</option>
              <option value="question">Question</option>
              <option value="problem_snapshot">Problem Snapshot</option>
              <option value="startling_fact">Startling Fact</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="hookTiming"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hook Timing (seconds)
            </label>
            <Input
              id="hookTiming"
              type="number"
              min="1"
              max="3"
              value={attributes.hookTiming || 2}
              onChange={(e) =>
                updateAttribute("hookTiming", Number.parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Tone & Style */}
      <div>
        <h3 className="text-lg font-medium mb-3">Tone & Style</h3>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="tone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tone
            </label>
            <select
              id="tone"
              value={attributes.tone || "conversational"}
              onChange={(e) =>
                updateAttribute(
                  "tone",
                  e.target.value as VideoScriptAttributes["tone"],
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="conversational">Conversational</option>
              <option value="casual">Casual</option>
              <option value="authentic">Authentic</option>
              <option value="energetic">Energetic</option>
              <option value="empathetic">Empathetic</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="pacing"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pacing
            </label>
            <select
              id="pacing"
              value={attributes.pacing || "medium"}
              onChange={(e) =>
                updateAttribute(
                  "pacing",
                  e.target.value as VideoScriptAttributes["pacing"],
                )
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="fast">Fast</option>
              <option value="medium">Medium</option>
              <option value="dynamic">Dynamic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <div className="pt-4">
        <Button type="submit" disabled={isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">🔄</span>
              Generating Scripts...
            </>
          ) : (
            <>
              <span className="mr-2">🚀</span>
              Generate Script Variations
            </>
          )}
        </Button>
      </div>

      {/* Quick Tips */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          💡 <strong>Tip:</strong> Product demos work best with 15-30s duration
        </p>
        <p>
          💡 <strong>Tip:</strong> Bold statements hooks perform 65% better in
          first 3 seconds
        </p>
        <p>
          💡 <strong>Tip:</strong> Fast pacing increases completion rates by 40%
        </p>
      </div>
    </form>
  );
}
