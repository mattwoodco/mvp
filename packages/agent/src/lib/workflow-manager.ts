import { EventEmitter } from "node:events";
import { db, eq, scriptGeneration, scriptVariation } from "@mvp/database";
import { nanoid } from "nanoid";
import PQueue from "p-queue";
import { scriptGeneratorAgent } from "../agents/script-generator";
import type {
  AgentStep,
  AgentWorkflow,
  ScriptGenerationRequest,
} from "../types/script";

export interface WorkflowNode {
  id: string;
  type: "input" | "process" | "output" | "decision";
  label: string;
  status: "pending" | "running" | "completed" | "failed";
  data?: any;
  position: { x: number; y: number };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface WorkflowProgress {
  workflowId: string;
  totalSteps: number;
  completedSteps: number;
  currentStep?: AgentStep;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export class WorkflowManager extends EventEmitter {
  private activeWorkflows: Map<string, AgentWorkflow> = new Map();
  private processingQueue: PQueue;

  constructor() {
    super();
    this.processingQueue = new PQueue({
      concurrency: 3, // Process up to 3 workflows simultaneously
      interval: 1000,
      intervalCap: 1,
    });

    this.processingQueue.on("active", () => {
      console.log(
        `Queue size: ${this.processingQueue.size}, Pending: ${this.processingQueue.pending}`,
      );
    });

    this.on("error", (error) => {
      console.error("Workflow error:", error);
    });
  }

  async createScriptGenerationWorkflow(
    request: ScriptGenerationRequest,
  ): Promise<string> {
    const workflowId = nanoid();
    const generationId = request.generationId || workflowId;
    console.log(`Creating workflow ${workflowId} for request:`, request);
    console.log(`Using generation ID: ${generationId}`);

    const workflow: AgentWorkflow = {
      id: workflowId,
      generationId,
      status: "pending",
      startTime: new Date(),
      totalSteps: 7,
      completedSteps: 0,
      steps: this.createWorkflowSteps(workflowId, request),
    };

    this.activeWorkflows.set(workflowId, workflow);
    console.log(
      `Added workflow ${workflowId} to active workflows. Total active: ${this.activeWorkflows.size}`,
    );

    this.processingQueue.add(() => this.executeWorkflow(workflowId, request));
    console.log(
      `Added workflow ${workflowId} to processing queue. Queue size: ${this.processingQueue.size}`,
    );

    return workflowId;
  }

  private createWorkflowSteps(
    workflowId: string,
    request: ScriptGenerationRequest,
  ): AgentStep[] {
    return [
      {
        id: nanoid(),
        name: "Initialize Request",
        status: "pending",
      },
      {
        id: nanoid(),
        name: "Analyze Product & Audience",
        status: "pending",
      },
      {
        id: nanoid(),
        name: "Generate Attribute Variations",
        status: "pending",
      },
      {
        id: nanoid(),
        name: "Create Script Content",
        status: "pending",
      },
      {
        id: nanoid(),
        name: "Optimize for Platforms",
        status: "pending",
      },
      {
        id: nanoid(),
        name: "Analyze Performance",
        status: "pending",
      },
      {
        id: nanoid(),
        name: "Finalize Results",
        status: "pending",
      },
    ];
  }

  private async executeWorkflow(
    workflowId: string,
    request: ScriptGenerationRequest,
  ): Promise<void> {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) {
      console.error(`Workflow ${workflowId} not found in active workflows`);
      return;
    }

    console.log(`Starting execution of workflow ${workflowId}`);
    console.log(`Workflow generation ID: ${workflow.generationId}`);
    try {
      workflow.status = "running";
      this.emitProgress(workflowId);

      // Step 1: Initialize Request
      await this.executeStep(workflow, 0, async () => {
        return {
          message: "Request initialized",
          productName: request.productName,
        };
      });

      // Step 2: Analyze Product & Audience
      await this.executeStep(workflow, 1, async () => {
        const result = await scriptGeneratorAgent.tools.analyzeScript.execute({
          input: {
            script: request.productDescription,
            targetAudience: request.targetAudience,
          },
        });
        return {
          analysis: result.analysis,
          targetSegments: result.suggestions,
          keyTriggers: request.keyBenefits,
        };
      });

      // Step 3: Generate Attribute Variations
      await this.executeStep(workflow, 2, async () => {
        const result =
          await scriptGeneratorAgent.tools.generateScriptVariations.execute({
            input: request,
          });
        return {
          attributeCombinations: result.variations.map(
            (v: { attributes: Record<string, string> }) => v.attributes,
          ),
          count: result.totalGenerated,
        };
      });

      // Step 4: Create Script Content
      await this.executeStep(workflow, 3, async () => {
        console.log(
          `Starting script content generation for workflow ${workflowId}`,
        );
        console.log(`Using generation ID: ${workflow.generationId}`);

        const result =
          await scriptGeneratorAgent.tools.generateScriptVariations.execute({
            input: request,
          });

        console.log(`Generated ${result.variations.length} variations`);
        console.log(`First variation ID: ${result.variations[0]?.id}`);

        // Save variations to database
        await db.transaction(async (tx) => {
          console.log(
            `Starting database transaction for workflow ${workflowId}`,
          );

          // Update generation status
          const updateResult = await tx
            .update(scriptGeneration)
            .set({
              status: "completed",
              completedAt: new Date(),
              totalProcessingTime: Date.now() - workflow.startTime.getTime(),
            })
            .where(eq(scriptGeneration.id, workflow.generationId));

          console.log(
            `Updated generation status for ID: ${workflow.generationId}`,
          );
          console.log("Update result:", updateResult);

          // Save variations
          for (const variation of result.variations) {
            console.log(
              `Inserting variation ${variation.id} for generation ${workflow.generationId}`,
            );
            await tx.insert(scriptVariation).values({
              id: variation.id,
              generationId: workflow.generationId,
              title: variation.title,
              script: variation.script,
              duration: variation.duration,
              hook: variation.hook,
              mainContent: variation.mainContent,
              callToAction: variation.callToAction,
              hookStyle: "bold_statement",
              adCategory: variation.attributes.adCategory,
              copywritingTone: variation.attributes.copywritingTone,
              visualStyle: variation.attributes.visualStyle,
              problemSolutionFraming:
                variation.attributes.problemSolutionFraming,
              pacingStyle: variation.attributes.pacingStyle,
              ctaApproach: variation.attributes.ctaApproach,
              estimatedEngagement: variation.estimatedEngagement,
              targetPlatforms: variation.targetPlatforms,
              processingTime: variation.processingTime,
            });
            console.log(`Successfully inserted variation ${variation.id}`);
          }
        });

        return {
          message: "Scripts generated successfully",
          scriptsGenerated: result.totalGenerated,
          variations: result.variations,
        };
      });

      // Step 5: Optimize for Platforms
      await this.executeStep(workflow, 4, async () => {
        const result =
          await scriptGeneratorAgent.tools.generateAttributeBasedScript.execute(
            {
              input: {
                productInfo: {
                  name: request.productName,
                  description: request.productDescription,
                  benefits: request.keyBenefits,
                },
                requiredAttributes: {
                  hookStyle: "bold_statement",
                  adCategory: "product_demo",
                  platform: "tiktok",
                },
                userId: request.userId,
              },
            },
          );
        return {
          optimizations: result.targetPlatforms,
          platformSpecificVariations: 1,
        };
      });

      // Step 6: Analyze Performance
      await this.executeStep(workflow, 5, async () => {
        const result = await scriptGeneratorAgent.tools.analyzeScript.execute({
          input: {
            script: request.productDescription,
            targetAudience: request.targetAudience,
          },
        });
        return {
          analysis: result.analysis,
          predictedEngagement:
            result.scores.conversionPotential > 7 ? "High" : "Medium",
          recommendedPlatforms: ["tiktok", "instagram_reels"],
        };
      });

      // Step 7: Finalize Results
      await this.executeStep(workflow, 6, async () => {
        return {
          message: "Workflow completed successfully",
          totalScripts: request.variationCount,
          processingTime: Date.now() - workflow.startTime.getTime(),
        };
      });

      workflow.status = "completed";
      workflow.endTime = new Date();
      this.emitProgress(workflowId);
    } catch (error) {
      console.error(`Workflow ${workflowId} failed:`, error);
      workflow.status = "failed";
      workflow.endTime = new Date();
      this.emit("error", { workflowId, error });
    }
  }

  private async executeStep(
    workflow: AgentWorkflow,
    stepIndex: number,
    executor: () => Promise<any>,
  ): Promise<void> {
    const step = workflow.steps[stepIndex];
    if (!step) {
      throw new Error(`Step ${stepIndex} not found`);
    }

    step.status = "running";
    step.startTime = new Date();
    this.emitProgress(workflow.id);

    try {
      const output = await executor();
      if (!step) {
        throw new Error(`Step ${stepIndex} not found`);
      }
      step.output = output;
      step.status = "completed";
      step.endTime = new Date();

      workflow.completedSteps++;
      this.emitProgress(workflow.id);
    } catch (error) {
      if (!step) {
        throw new Error(`Step ${stepIndex} not found`);
      }
      step.status = "failed";
      step.error = error instanceof Error ? error.message : "Unknown error";
      step.endTime = new Date();
      throw error;
    }
  }

  private generateAttributeCombinations(
    count: number,
  ): Array<{ [key: string]: string }> {
    const hookStyles = [
      "bold_statement",
      "provocative_question",
      "problem_snapshot",
      "startling_visual",
    ] as const;
    const adCategories = [
      "product_demo",
      "tutorial",
      "customer_testimonial",
      "ugc_style",
      "before_after_transformation",
      "storytelling_narrative",
    ] as const;
    const platforms = ["tiktok", "instagram_reels", "youtube_shorts"] as const;

    const combinations: Array<{ [key: string]: string }> = [];

    for (let i = 0; i < count; i++) {
      const hookStyle = hookStyles[i % hookStyles.length];
      const adCategory = adCategories[i % adCategories.length];
      const platform = platforms[i % platforms.length];

      combinations.push({
        hookStyle: String(hookStyle),
        adCategory: String(adCategory),
        platform: String(platform),
        variationIndex: String(i + 1),
      });
    }

    return combinations;
  }

  private emitProgress(workflowId: string): void {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow) return;

    const progress: WorkflowProgress = {
      workflowId,
      totalSteps: workflow.totalSteps,
      completedSteps: workflow.completedSteps,
      currentStep: workflow.steps.find(
        (step: AgentStep) => step.status === "running",
      ),
      nodes: this.generateFlowNodes(workflow),
      edges: this.generateFlowEdges(workflow),
    };

    this.emit("progress", progress);
  }

  private generateFlowNodes(workflow: AgentWorkflow): WorkflowNode[] {
    const nodes: WorkflowNode[] = [
      {
        id: "start",
        type: "input",
        label: "Start",
        status: "completed",
        position: { x: 100, y: 50 },
      },
    ];

    workflow.steps.forEach((step: AgentStep, index: number) => {
      nodes.push({
        id: step.id,
        type: "process",
        label: step.name,
        status: step.status,
        data: step.output,
        position: {
          x: 100 + (index % 3) * 200,
          y: 150 + Math.floor(index / 3) * 100,
        },
      });
    });

    nodes.push({
      id: "end",
      type: "output",
      label: "Complete",
      status: workflow.status === "completed" ? "completed" : "pending",
      position: { x: 300, y: 450 },
    });

    return nodes;
  }

  private generateFlowEdges(workflow: AgentWorkflow): WorkflowEdge[] {
    const edges: WorkflowEdge[] = [];
    for (let i = 0; i < workflow.steps.length - 1; i++) {
      const currentStep = workflow.steps[i];
      const nextStep = workflow.steps[i + 1];
      if (!currentStep || !nextStep) continue;
      edges.push({
        id: `${currentStep.id}-${nextStep.id}`,
        source: currentStep.id,
        target: nextStep.id,
      });
    }
    const lastStep = workflow.steps[workflow.steps.length - 1];
    if (lastStep) {
      edges.push({
        id: `${lastStep.id}-end`,
        source: lastStep.id,
        target: "end",
      });
    }

    return edges;
  }

  getWorkflowStatus(workflowId: string): AgentWorkflow | undefined {
    return this.activeWorkflows.get(workflowId);
  }

  getActiveWorkflows(): AgentWorkflow[] {
    return Array.from(this.activeWorkflows.values());
  }

  cancelWorkflow(workflowId: string): boolean {
    const workflow = this.activeWorkflows.get(workflowId);
    if (!workflow || workflow.status === "completed") return false;

    workflow.status = "failed";
    workflow.endTime = new Date();
    this.activeWorkflows.delete(workflowId);

    this.emit("cancelled", { workflowId });
    return true;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const workflowManager = new WorkflowManager();

console.log("Type of scriptGeneration.id:", typeof scriptGeneration.id);
console.log("Type of eq:", typeof eq);
