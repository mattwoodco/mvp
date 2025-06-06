"use client";

import { Checkbox } from "@mvp/ui/checkbox";
import { Label } from "@mvp/ui/label";
import { Badge } from "@mvp/ui/badge";
import { VideoScriptAttributes } from "@mvp/agent";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@mvp/ui/tooltip";

interface AttributeSelectorProps {
  attributes: VideoScriptAttributes;
  onChange: (key: keyof VideoScriptAttributes, value: boolean) => void;
}

const attributeCategories = {
  "Core Content": [
    { key: "hookFastPaceRapidly", label: "Fast-Paced Hook", tooltip: "Grab attention within 1-3 seconds with rapid pacing" },
    { key: "conversationalCopywriting", label: "Conversational Copy", tooltip: "Use casual, direct, authentic tone" },
    { key: "dynamicVisualStyle", label: "Dynamic Visuals", tooltip: "Fast-moving visuals with quick cuts" },
    { key: "relatableFraming", label: "Relatable Framing", tooltip: "Frame content to resonate with viewer interests" },
    { key: "strongCTA", label: "Strong CTA", tooltip: "Include clear, soft calls-to-action" },
  ],
  "Ad Formats": [
    { key: "productDemo", label: "Product Demo", tooltip: "Show product in action with demonstration" },
    { key: "customerTestimonial", label: "Customer Testimonial", tooltip: "Feature authentic user testimonials" },
    { key: "beforeAfterTransformation", label: "Before/After", tooltip: "Show dramatic before/after contrast" },
    { key: "storytellingNarrative", label: "Storytelling", tooltip: "Tell a mini story with beginning, middle, end" },
  ],
  "Content Approach": [
    { key: "problemSolutionFraming", label: "Problem/Solution", tooltip: "Open with problem, position product as solution" },
    { key: "lifestyleIntegration", label: "Lifestyle Integration", tooltip: "Integrate product into everyday scenarios" },
    { key: "socialProof", label: "Social Proof", tooltip: "Mention how many people use/love the product" },
    { key: "trendAlignment", label: "Trend Alignment", tooltip: "Align with viral trends or challenges" },
  ],
  "Technical Elements": [
    { key: "emotionalAppeal", label: "Emotional Appeal", tooltip: "Use humor, inspiration, or touching moments" },
    { key: "visualRichness", label: "Visual Richness", tooltip: "Use engaging visuals and graphics" },
    { key: "platformNativeStyle", label: "Platform Native", tooltip: "Match platform's native content style" },
    { key: "musicSoundIntegration", label: "Music/Sound", tooltip: "Use trending audio or custom music" },
    { key: "textOverlayCaptions", label: "Text Overlays", tooltip: "Include on-screen text and captions" },
  ],
  "Optimization": [
    { key: "brandIntegration", label: "Brand Integration", tooltip: "Seamlessly integrate brand/product early" },
    { key: "authenticity", label: "Authenticity", tooltip: "Feel genuine and not overly polished" },
    { key: "brevity", label: "Brevity", tooltip: "Keep to 15-30 seconds optimal length" },
    { key: "mobileFirstFormat", label: "Mobile First", tooltip: "Optimize for vertical mobile viewing" },
    { key: "interactiveElements", label: "Interactive", tooltip: "Encourage engagement or continuation" },
    { key: "urgencyScarcity", label: "Urgency/Scarcity", tooltip: "Include limited time offers or FOMO elements" },
  ],
};

export function AttributeSelector({ attributes, onChange }: AttributeSelectorProps) {
  const getActiveCount = () => {
    return Object.values(attributes).filter(Boolean).length;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Selected attributes:
            </span>
            <Badge variant="secondary">{getActiveCount()} / 24</Badge>
          </div>
          <div className="flex gap-2">
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => {
                Object.keys(attributes).forEach((key) => {
                  onChange(key as keyof VideoScriptAttributes, true);
                });
              }}
            >
              Select All
            </button>
            <span className="text-muted-foreground">|</span>
            <button
              className="text-sm text-primary hover:underline"
              onClick={() => {
                Object.keys(attributes).forEach((key) => {
                  onChange(key as keyof VideoScriptAttributes, false);
                });
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {Object.entries(attributeCategories).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map(({ key, label, tooltip }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={attributes[key as keyof VideoScriptAttributes]}
                    onCheckedChange={(checked) =>
                      onChange(key as keyof VideoScriptAttributes, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={key}
                    className="flex items-center gap-2 cursor-pointer flex-1"
                  >
                    <span>{label}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{tooltip}</p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
}