"use client";

import { useState } from "react";
import { Card } from "@mvp/ui/card";
import { Button } from "@mvp/ui/button";
import { Badge } from "@mvp/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@mvp/ui/tabs";
import { GeneratedScript } from "@mvp/agent";
import { Copy, Download, Save, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@mvp/ui/dialog";
import { Input } from "@mvp/ui/input";
import { Label } from "@mvp/ui/label";
import { Textarea } from "@mvp/ui/textarea";

interface ScriptResultsProps {
  scripts: GeneratedScript[];
  productName: string;
  generationId: string | null;
}

export function ScriptResults({ scripts, productName, generationId }: ScriptResultsProps) {
  const [selectedScript, setSelectedScript] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const handleCopyScript = (script: GeneratedScript) => {
    navigator.clipboard.writeText(script.scriptText);
    toast.success("Script copied to clipboard");
  };

  const handleDownloadAll = () => {
    const content = scripts.map((script, index) => 
      `=== Script Variation ${index + 1} ===\n\n${script.scriptText}\n\nDuration: ${script.duration}\nConfidence: ${(script.confidence * 100).toFixed(0)}%\nPrimary Attributes: ${script.primaryAttributes.join(", ")}\n\n`
    ).join("\n---\n\n");
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${productName.replace(/\s+/g, "-")}-scripts.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Scripts downloaded");
  };

  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }

    try {
      const response = await fetch("/api/agent/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: templateName,
          description: templateDescription,
          generationId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save template");
      }

      toast.success("Template saved successfully");
      setTemplateName("");
      setTemplateDescription("");
    } catch (error) {
      toast.error("Failed to save template");
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Generated Scripts</h2>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as Template</DialogTitle>
                <DialogDescription>
                  Save these generation settings as a template for future use.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., High-Energy Product Launch"
                  />
                </div>
                <div>
                  <Label htmlFor="templateDescription">Description (Optional)</Label>
                  <Textarea
                    id="templateDescription"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe when to use this template..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveTemplate}>Save Template</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="sm" onClick={handleDownloadAll}>
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>
      </div>

      <Tabs value={selectedScript.toString()} onValueChange={(v) => setSelectedScript(parseInt(v))}>
        <TabsList className="flex flex-wrap h-auto p-1">
          {scripts.map((_, index) => (
            <TabsTrigger key={index} value={index.toString()} className="mb-1">
              Script {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {scripts.map((script, index) => (
          <TabsContent key={index} value={index.toString()} className="space-y-4 mt-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Script Variation {index + 1}</h3>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">Duration: {script.duration}</Badge>
                    <Badge variant="secondary">
                      Confidence: {(script.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyScript(script)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>

              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg">
                  {script.scriptText}
                </pre>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <button
                    className="flex items-center justify-between w-full text-left font-semibold"
                    onClick={() => toggleSection(`visual-${index}`)}
                  >
                    <span>Visual Directions</span>
                    {expandedSections[`visual-${index}`] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections[`visual-${index}`] && (
                    <ul className="mt-2 space-y-1">
                      {script.visualDirections.map((direction, i) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          • {direction}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div>
                  <button
                    className="flex items-center justify-between w-full text-left font-semibold"
                    onClick={() => toggleSection(`audio-${index}`)}
                  >
                    <span>Audio Directions</span>
                    {expandedSections[`audio-${index}`] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections[`audio-${index}`] && (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {script.audioDirections}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    className="flex items-center justify-between w-full text-left font-semibold"
                    onClick={() => toggleSection(`attributes-${index}`)}
                  >
                    <span>Primary Attributes</span>
                    {expandedSections[`attributes-${index}`] ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  {expandedSections[`attributes-${index}`] && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {script.primaryAttributes.map((attr) => (
                        <Badge key={attr} variant="outline">
                          {attr}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}