"use client";

import type { ScriptGenerationResponse } from "@mvp/agent";
import { defaultScriptRequest } from "@mvp/agent/lib/defaults";
import { Button } from "@mvp/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mvp/ui/card";
import { Input } from "@mvp/ui/input";
import { Loader2, PlayCircle, Sparkles, Zap } from "lucide-react";
import { useCallback, useState } from "react";

interface FormData {
  productName: string;
  productDescription: string;
  targetAudience: string;
  keyBenefits: string[];
  brandTone: string;
  competitorInfo: string;
  customPrompt: string;
  variationCount: number;
}

export default function AgentPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "workflow" | "results">(
    "form",
  );
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generatedScripts, setGeneratedScripts] =
    useState<ScriptGenerationResponse | null>(null);
  const [formData, setFormData] = useState<FormData>({
    productName: defaultScriptRequest.productName,
    productDescription: defaultScriptRequest.productDescription,
    targetAudience: defaultScriptRequest.targetAudience,
    keyBenefits: defaultScriptRequest.keyBenefits,
    brandTone: defaultScriptRequest.brandTone || "",
    competitorInfo: defaultScriptRequest.competitorInfo || "",
    customPrompt: defaultScriptRequest.customPrompt || "",
    variationCount: defaultScriptRequest.variationCount,
  });
  const [error, setError] = useState<string | null>(null);
  const [isTimeout, setIsTimeout] = useState(false);

  const updateFormField = useCallback((field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const addBenefit = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      keyBenefits: [...prev.keyBenefits, ""],
    }));
  }, []);

  const removeBenefit = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      keyBenefits: prev.keyBenefits.filter((_, i) => i !== index),
    }));
  }, []);

  const updateBenefit = useCallback((index: number, value: string) => {
    setFormData((prev) => {
      const newBenefits = [...prev.keyBenefits];
      newBenefits[index] = value;
      return { ...prev, keyBenefits: newBenefits };
    });
  }, []);

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsGenerating(true);
      setActiveTab("workflow");
      setError(null);
      setIsTimeout(false);

      try {
        const response = await fetch("/api/agent/generate-scripts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Script generation failed:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(
            errorData.error || "Failed to start script generation",
          );
        }

        const { generationId: newGenerationId } = await response.json();
        setGenerationId(newGenerationId);

        let attempts = 0;
        const maxAttempts = 30; // 1 minute total (30 * 2 seconds)

        const pollInterval = setInterval(async () => {
          attempts++;
          console.log(`Polling attempt ${attempts}/${maxAttempts}`);

          try {
            const scriptsResponse = await fetch(
              `/api/agent/scripts/${newGenerationId}`,
            );
            console.log("Poll response status:", scriptsResponse.status);

            if (scriptsResponse.ok) {
              const data = await scriptsResponse.json();
              console.log("Poll response data:", {
                status: data.status,
                variationsCount: data.variations?.length,
              });

              if (data.status === "completed") {
                console.log("Generation completed successfully");
                setGeneratedScripts(data);
                setActiveTab("results");
                setIsGenerating(false);
                clearInterval(pollInterval);
              } else if (data.status === "failed") {
                console.error("Generation failed:", data.error);
                throw new Error(data.error || "Script generation failed");
              } else if (data.status === "pending") {
                console.log("Generation still pending...");
              }
            } else {
              console.error("Poll request failed:", scriptsResponse.status);
              throw new Error(`HTTP error! status: ${scriptsResponse.status}`);
            }
          } catch (error) {
            console.error("Polling error:", error);
            clearInterval(pollInterval);
            setIsGenerating(false);
            setError(
              error instanceof Error
                ? error.message
                : "Failed to generate scripts",
            );
          }

          if (attempts >= maxAttempts) {
            console.log("Max polling attempts reached");
            clearInterval(pollInterval);
            setIsGenerating(false);
            setIsTimeout(true);
          }
        }, 2000);

        // Clear interval after 2 minutes as a fallback
        setTimeout(() => {
          clearInterval(pollInterval);
          if (isGenerating) {
            setIsGenerating(false);
            setIsTimeout(true);
          }
        }, 120000);
      } catch (error) {
        setIsGenerating(false);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to start script generation",
        );
        console.error("Generation error:", error);
      }
    },
    [formData, isGenerating],
  );

  const TabButton = ({
    id,
    children,
    active,
    disabled = false,
  }: {
    id: "form" | "workflow" | "results";
    children: React.ReactNode;
    active: boolean;
    disabled?: boolean;
  }) => (
    <Button
      variant={active ? "default" : "outline"}
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className="flex items-center gap-2"
    >
      {children}
    </Button>
  );

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI Script Generator
        </h1>
        <p className="text-xl text-center text-gray-600 max-w-2xl mx-auto">
          Generate 12 high-converting video ad scripts using Cerebras-powered AI
          agents. Perfect for TikTok, Instagram Reels, and YouTube Shorts.
        </p>
      </div>

      <div className="space-y-6">
        <div className="flex gap-2 justify-center">
          <TabButton id="form" active={activeTab === "form"}>
            <Sparkles className="w-4 h-4" />
            Configure
          </TabButton>
          <TabButton
            id="workflow"
            active={activeTab === "workflow"}
            disabled={!isGenerating && activeTab === "form"}
          >
            <PlayCircle className="w-4 h-4" />
            Workflow
          </TabButton>
          <TabButton
            id="results"
            active={activeTab === "results"}
            disabled={activeTab !== "results"}
          >
            <Zap className="w-4 h-4" />
            Results
          </TabButton>
        </div>

        {activeTab === "form" && (
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
              <CardDescription>
                Provide details about your product to generate targeted video ad
                scripts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="productName"
                      className="text-sm font-medium"
                    >
                      Product Name *
                    </label>
                    <Input
                      id="productName"
                      value={formData.productName}
                      onChange={(e) =>
                        updateFormField("productName", e.target.value)
                      }
                      placeholder="e.g., EcoClean All-Purpose Cleaner"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="targetAudience"
                      className="text-sm font-medium"
                    >
                      Target Audience *
                    </label>
                    <Input
                      id="targetAudience"
                      value={formData.targetAudience}
                      onChange={(e) =>
                        updateFormField("targetAudience", e.target.value)
                      }
                      placeholder="e.g., Busy parents, eco-conscious millennials"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="productDescription"
                    className="text-sm font-medium"
                  >
                    Product Description *
                  </label>
                  <textarea
                    id="productDescription"
                    value={formData.productDescription}
                    onChange={(e) =>
                      updateFormField("productDescription", e.target.value)
                    }
                    placeholder="Describe your product, what it does, and what makes it unique..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm font-medium">Key Benefits *</span>
                  <div className="space-y-2">
                    {formData.keyBenefits.map((benefit, index) => (
                      <div
                        key={`benefit-input-${Date.now()}-${index}`}
                        className="flex gap-2"
                      >
                        <Input
                          value={benefit}
                          onChange={(e) => updateBenefit(index, e.target.value)}
                          placeholder={`Benefit ${index + 1}`}
                          required={index === 0}
                        />
                        {formData.keyBenefits.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeBenefit(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addBenefit}
                      className="w-full"
                    >
                      Add Benefit
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="brandTone" className="text-sm font-medium">
                      Brand Tone (Optional)
                    </label>
                    <Input
                      id="brandTone"
                      value={formData.brandTone}
                      onChange={(e) =>
                        updateFormField("brandTone", e.target.value)
                      }
                      placeholder="e.g., Professional, Friendly, Humorous"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="variationCount"
                      className="text-sm font-medium"
                    >
                      Number of Variations
                    </label>
                    <Input
                      id="variationCount"
                      type="number"
                      min="1"
                      max="12"
                      value={formData.variationCount}
                      onChange={(e) =>
                        updateFormField(
                          "variationCount",
                          Number.parseInt(e.target.value) || 12,
                        )
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="competitorInfo"
                    className="text-sm font-medium"
                  >
                    Competitor Information (Optional)
                  </label>
                  <textarea
                    id="competitorInfo"
                    value={formData.competitorInfo}
                    onChange={(e) =>
                      updateFormField("competitorInfo", e.target.value)
                    }
                    placeholder="What are your competitors doing? How do you differentiate?"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="customPrompt" className="text-sm font-medium">
                    Custom Requirements (Optional)
                  </label>
                  <textarea
                    id="customPrompt"
                    value={formData.customPrompt}
                    onChange={(e) =>
                      updateFormField("customPrompt", e.target.value)
                    }
                    placeholder="Any specific requirements, style preferences, or constraints..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Scripts...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Scripts
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {activeTab === "workflow" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5" />
                Workflow Progress
              </CardTitle>
              <CardDescription>
                Watch your AI agents work together to generate high-converting
                scripts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Processing your request...
                    </p>
                    <p className="text-sm text-gray-600">
                      Generating {formData.variationCount} script variations
                      using Cerebras models
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Running
                  </div>
                </div>

                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Agent workflow in progress...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    This may take 30-60 seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "results" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Generated Scripts
              </CardTitle>
              <CardDescription>
                Your high-converting video ad scripts are ready!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedScripts ? (
                <div className="space-y-6">
                  {generatedScripts.variations.map((variation) => (
                    <Card key={variation.id}>
                      <CardHeader>
                        <CardTitle>{variation.title}</CardTitle>
                        <CardDescription>
                          Duration: {variation.duration}s | Best for:{" "}
                          {variation.targetPlatforms.join(", ")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Hook</h4>
                          <p className="text-sm text-gray-600">
                            {variation.hook}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Main Content</h4>
                          <p className="text-sm text-gray-600">
                            {variation.mainContent}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Call to Action</h4>
                          <p className="text-sm text-gray-600">
                            {variation.callToAction}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Hook Style:</span>{" "}
                            {variation.attributes.hookStyle}
                          </div>
                          <div>
                            <span className="font-medium">Ad Category:</span>{" "}
                            {variation.attributes.adCategory}
                          </div>
                          <div>
                            <span className="font-medium">Visual Style:</span>{" "}
                            {variation.attributes.visualStyle}
                          </div>
                          <div>
                            <span className="font-medium">
                              Estimated Engagement:
                            </span>{" "}
                            {variation.estimatedEngagement}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    onClick={() => setActiveTab("form")}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Generate More Scripts
                  </Button>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="max-w-2xl mx-auto">
                    <div className="mb-6">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Zap className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-800 mb-2">
                        Scripts Generated Successfully!
                      </h3>
                      <p className="text-gray-600">
                        {formData.variationCount} unique video ad scripts have
                        been generated for {formData.productName}.
                      </p>
                    </div>
                    <Button
                      onClick={() => setActiveTab("form")}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      Generate More Scripts
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
