"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@mvp/ui/button";
import { Card } from "@mvp/ui/card";
import { Label } from "@mvp/ui/label";
import { Input } from "@mvp/ui/input";
import { Textarea } from "@mvp/ui/textarea";
import { Checkbox } from "@mvp/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mvp/ui/tabs";
import { VideoScriptAttributes, AgentProgress, GeneratedScript } from "@mvp/agent";
import { AgentFlowVisualizer } from "./agent-flow-visualizer";
import { ScriptResults } from "./script-results";
import { AttributeSelector } from "./attribute-selector";

interface VideoScriptGeneratorProps {
  userId: string;
}

export function VideoScriptGenerator({ userId }: VideoScriptGeneratorProps) {
  const [attributes, setAttributes] = useState<VideoScriptAttributes>({
    hookFastPaceRapidly: true,
    conversationalCopywriting: true,
    dynamicVisualStyle: true,
    relatableFraming: true,
    strongCTA: true,
    productDemo: false,
    customerTestimonial: false,
    beforeAfterTransformation: false,
    storytellingNarrative: false,
    problemSolutionFraming: true,
    lifestyleIntegration: false,
    socialProof: false,
    trendAlignment: false,
    emotionalAppeal: false,
    visualRichness: true,
    platformNativeStyle: true,
    musicSoundIntegration: false,
    textOverlayCaptions: true,
    brandIntegration: true,
    authenticity: true,
    brevity: true,
    mobileFirstFormat: true,
    interactiveElements: false,
    urgencyScarcity: false,
  });

  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [numberOfVariations, setNumberOfVariations] = useState(12);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<AgentProgress | null>(null);
  const [results, setResults] = useState<GeneratedScript[]>([]);
  const [generationId, setGenerationId] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!productName.trim()) {
      toast.error("Please enter a product name");
      return;
    }

    setIsGenerating(true);
    setProgress(null);
    setResults([]);

    try {
      const response = await fetch("/api/agent/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attributes,
          productName,
          productDescription,
          targetAudience,
          brandTone,
          numberOfVariations,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start generation");
      }

      const { generationId } = await response.json();
      setGenerationId(generationId);

      // Start polling for progress
      const eventSource = new EventSource(`/api/agent/progress/${generationId}`);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "progress") {
          setProgress(data.progress);
        } else if (data.type === "complete") {
          setResults(data.scripts);
          setIsGenerating(false);
          eventSource.close();
          toast.success("Scripts generated successfully!");
        } else if (data.type === "error") {
          toast.error(data.message);
          setIsGenerating(false);
          eventSource.close();
        }
      };

      eventSource.onerror = () => {
        toast.error("Connection lost");
        setIsGenerating(false);
        eventSource.close();
      };
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate scripts");
      setIsGenerating(false);
    }
  };

  const handleAttributeChange = (key: keyof VideoScriptAttributes, value: boolean) => {
    setAttributes(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="setup" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="progress" disabled={!isGenerating && results.length === 0}>
            Progress
          </TabsTrigger>
          <TabsTrigger value="results" disabled={results.length === 0}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Product Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., FitTrack Pro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="productDescription">Product Description</Label>
                <Textarea
                  id="productDescription"
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="Describe what your product does and its key benefits..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Health-conscious millennials"
                />
              </div>

              <div>
                <Label htmlFor="brandTone">Brand Tone</Label>
                <Input
                  id="brandTone"
                  value={brandTone}
                  onChange={(e) => setBrandTone(e.target.value)}
                  placeholder="e.g., Friendly, professional, energetic"
                />
              </div>

              <div>
                <Label htmlFor="variations">Number of Variations</Label>
                <Input
                  id="variations"
                  type="number"
                  min={1}
                  max={20}
                  value={numberOfVariations}
                  onChange={(e) => setNumberOfVariations(parseInt(e.target.value))}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-2xl font-semibold mb-4">Video Script Attributes</h2>
            <p className="text-muted-foreground mb-6">
              Select the attributes you want to emphasize in your video scripts. 
              The AI will create variations focusing on different combinations.
            </p>
            <AttributeSelector
              attributes={attributes}
              onChange={handleAttributeChange}
            />
          </Card>

          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !productName.trim()}
            >
              {isGenerating ? "Generating..." : "Generate Scripts"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {progress && (
            <AgentFlowVisualizer
              progress={progress}
              totalScripts={numberOfVariations}
            />
          )}
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          {results.length > 0 && (
            <ScriptResults
              scripts={results}
              productName={productName}
              generationId={generationId}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}