import { cerebras } from '@ai-sdk/cerebras';
import { mistral } from '@ai-sdk/mistral';
import { generateObject, generateText } from 'ai';
import { nanoid } from 'nanoid';
import type { 
  VideoScriptAttributes, 
  ScriptGenerationRequest, 
  GeneratedScript,
  AgentProgress 
} from './types';
import { analyzeAttributesTool, generateScriptTool, optimizeScriptTool } from './tools';

export class VideoScriptAgent {
  private progressCallback?: (progress: AgentProgress) => void;
  
  constructor(config?: {
    onProgress?: (progress: AgentProgress) => void;
  }) {
    this.progressCallback = config?.onProgress;
  }
  
  private updateProgress(progress: AgentProgress) {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
  
  async generateScripts(request: ScriptGenerationRequest): Promise<GeneratedScript[]> {
    const scripts: GeneratedScript[] = [];
    
    try {
      // Stage 1: Analyze attributes and plan approach
      this.updateProgress({
        stage: 'analyzing',
        currentScript: 0,
        totalScripts: request.numberOfVariations,
        message: 'Analyzing selected attributes and planning creative approach...',
        timestamp: Date.now(),
      });
      
      const analysis = await this.analyzeAttributes(request.attributes, {
        productName: request.productName,
        productDescription: request.productDescription,
        targetAudience: request.targetAudience,
      });
      
      // Stage 2: Generate script variations
      for (let i = 0; i < request.numberOfVariations; i++) {
        this.updateProgress({
          stage: 'generating',
          currentScript: i + 1,
          totalScripts: request.numberOfVariations,
          message: `Generating script variation ${i + 1} of ${request.numberOfVariations}...`,
          timestamp: Date.now(),
        });
        
        const script = await this.generateSingleScript(
          request,
          analysis,
          i + 1
        );
        
        scripts.push(script);
      }
      
      // Stage 3: Optimize all scripts
      this.updateProgress({
        stage: 'optimizing',
        currentScript: request.numberOfVariations,
        totalScripts: request.numberOfVariations,
        message: 'Optimizing scripts for maximum impact...',
        timestamp: Date.now(),
      });
      
      const optimizedScripts = await this.optimizeScripts(scripts);
      
      // Stage 4: Finalize
      this.updateProgress({
        stage: 'finalizing',
        currentScript: request.numberOfVariations,
        totalScripts: request.numberOfVariations,
        message: 'Finalizing script variations...',
        timestamp: Date.now(),
      });
      
      return optimizedScripts;
    } catch (error) {
      console.error('Error generating scripts:', error);
      throw error;
    }
  }
  
  private async analyzeAttributes(attributes: VideoScriptAttributes, productContext: any) {
    // Use Mistral for initial analysis
    const { object } = await generateObject({
      model: mistral('mistral-large-latest'),
      schema: analyzeAttributesTool.parameters,
      prompt: `Analyze these video script attributes and determine the best creative approach:
        
        Active Attributes: ${JSON.stringify(attributes, null, 2)}
        Product Context: ${JSON.stringify(productContext, null, 2)}
        
        Identify synergies between attributes and recommend the primary creative approach.`,
    });
    
    return analyzeAttributesTool.execute(object);
  }
  
  private async generateSingleScript(
    request: ScriptGenerationRequest,
    analysis: any,
    variationNumber: number
  ): Promise<GeneratedScript> {
    // Determine which attributes to focus on for this variation
    const activeAttributes = Object.entries(request.attributes)
      .filter(([_, active]) => active)
      .map(([key]) => key);
    
    // Rotate focus attributes for variety
    const focusAttributes = this.selectFocusAttributes(activeAttributes, variationNumber);
    
    // Use Cerebras for fast script generation
    const { text: scriptContent } = await generateText({
      model: cerebras('llama-3.3-70b'),
      prompt: this.buildScriptPrompt(request, analysis, focusAttributes, variationNumber),
      maxTokens: 800,
    });
    
    // Parse the generated script
    const parsedScript = await this.parseGeneratedScript(scriptContent, focusAttributes);
    
    return {
      id: nanoid(),
      ...parsedScript,
      primaryAttributes: focusAttributes,
      confidence: 0.75 + Math.random() * 0.2, // Placeholder confidence
    };
  }
  
  private selectFocusAttributes(attributes: string[], variationNumber: number): string[] {
    // Rotate through different combinations of attributes
    const numToSelect = Math.min(3 + (variationNumber % 3), attributes.length);
    const shuffled = [...attributes].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numToSelect);
  }
  
  private buildScriptPrompt(
    request: ScriptGenerationRequest,
    analysis: any,
    focusAttributes: string[],
    variationNumber: number
  ): string {
    return `Create a compelling short-form video ad script with the following requirements:

Product: ${request.productName || 'Product'}
Description: ${request.productDescription || 'A great product'}
Target Audience: ${request.targetAudience || 'General audience'}
Brand Tone: ${request.brandTone || 'Professional yet approachable'}

Creative Approach: ${analysis.primaryApproach}
Suggested Duration: ${analysis.suggestedDuration}

PRIMARY FOCUS ATTRIBUTES for this variation:
${focusAttributes.map(attr => `- ${attr}`).join('\n')}

SCRIPT REQUIREMENTS:
1. Start with a strong hook (1-3 seconds)
2. Include clear visual directions in [brackets]
3. Include audio/music suggestions in (parentheses)
4. End with a compelling CTA
5. Keep total duration under 30 seconds
6. Make it feel native to social media platforms

FORMAT YOUR RESPONSE AS:
HOOK: [visual] Script text (audio)
BODY: [visual] Script text (audio)
CTA: [visual] Script text (audio)

Generate script variation #${variationNumber}:`;
  }
  
  private async parseGeneratedScript(scriptContent: string, focusAttributes: string[]): Promise<Omit<GeneratedScript, 'id' | 'primaryAttributes' | 'confidence'>> {
    // Parse the generated script into structured format
    const sections = scriptContent.split(/\n(?=HOOK:|BODY:|CTA:)/);
    
    const visualDirections: string[] = [];
    const keyHooks: string[] = [];
    let scriptText = '';
    let audioDirections = '';
    
    sections.forEach(section => {
      // Extract visual directions [...]
      const visuals = section.match(/\[([^\]]+)\]/g) || [];
      visualDirections.push(...visuals.map(v => v.slice(1, -1)));
      
      // Extract audio directions (...)
      const audio = section.match(/\(([^)]+)\)/g) || [];
      if (audio.length > 0) {
        audioDirections = audio.map(a => a.slice(1, -1)).join('; ');
      }
      
      // Extract script text
      const cleanText = section
        .replace(/\[([^\]]+)\]/g, '')
        .replace(/\(([^)]+)\)/g, '')
        .replace(/^(HOOK|BODY|CTA):\s*/gm, '')
        .trim();
      
      if (cleanText) {
        scriptText += cleanText + '\n\n';
      }
      
      // Extract hooks from the HOOK section
      if (section.startsWith('HOOK:')) {
        keyHooks.push(cleanText.split('.')[0].trim());
      }
    });
    
    return {
      scriptText: scriptText.trim(),
      duration: this.estimateDuration(scriptText),
      visualDirections,
      audioDirections,
      keyHooks,
    };
  }
  
  private estimateDuration(scriptText: string): string {
    // Estimate based on word count (150 words per minute average speaking pace)
    const wordCount = scriptText.split(/\s+/).length;
    const seconds = Math.ceil((wordCount / 150) * 60);
    return `${seconds}s`;
  }
  
  private async optimizeScripts(scripts: GeneratedScript[]): Promise<GeneratedScript[]> {
    // Use Mistral for optimization pass
    const optimizationPrompts = scripts.map((script, index) => ({
      script,
      prompt: `Review and optimize this video script for maximum impact:
        
        ${script.scriptText}
        
        Visual Directions: ${script.visualDirections.join(', ')}
        Audio: ${script.audioDirections}
        
        Optimize for:
        1. Stronger hook
        2. Clearer value proposition
        3. More compelling CTA
        4. Platform-native feel
        
        Keep the same overall structure and message.`,
    }));
    
    // Batch optimize for efficiency
    const optimizedScripts = await Promise.all(
      optimizationPrompts.map(async ({ script, prompt }) => {
        const { text } = await generateText({
          model: mistral('mistral-large-latest'),
          prompt,
          maxTokens: 500,
        });
        
        return {
          ...script,
          scriptText: text,
          confidence: Math.min(script.confidence + 0.1, 0.95),
        };
      })
    );
    
    return optimizedScripts;
  }
}