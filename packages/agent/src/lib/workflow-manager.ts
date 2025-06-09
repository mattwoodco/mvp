import { EventEmitter } from "node:events";
import { nanoid } from "nanoid";
import PQueue from "p-queue";
import type {
  AgentStep,
  AgentWorkflow,
  ScriptGenerationRequest,
  ScriptGenerationResponse,
  ScriptVariation,
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
  }

  async createScriptGenerationWorkflow(
    request: ScriptGenerationRequest,
  ): Promise<string> {
    const workflowId = nanoid();

    const workflow: AgentWorkflow = {
      id: workflowId,
      generationId: workflowId,
      status: "pending",
      startTime: new Date(),
      totalSteps: 7,
      completedSteps: 0,
      steps: this.createWorkflowSteps(workflowId, request),
    };

    this.activeWorkflows.set(workflowId, workflow);

    // Add to processing queue
    this.processingQueue.add(() => this.executeWorkflow(workflowId, request));

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
    if (!workflow) return;

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
        await this.delay(1000); // Simulate analysis time
        return {
          analysis: "Product analysis complete",
          targetSegments: ["millennials", "gen-z"],
          keyTriggers: request.keyBenefits,
        };
      });

      // Step 3: Generate Attribute Variations
      await this.executeStep(workflow, 2, async () => {
        const attributeCombinations = this.generateAttributeCombinations(
          request.variationCount,
        );
        return { attributeCombinations, count: attributeCombinations.length };
      });

      // Step 4: Create Script Content
      await this.executeStep(workflow, 3, async () => {
        await this.delay(2000); // Simulate script generation time
        return {
          message: "Scripts generated using Cerebras models",
          scriptsGenerated: request.variationCount,
        };
      });

      // Step 5: Optimize for Platforms
      await this.executeStep(workflow, 4, async () => {
        await this.delay(1500);
        return {
          optimizations: [
            "TikTok trending sounds",
            "Instagram hashtags",
            "YouTube keywords",
          ],
          platformSpecificVariations: 12,
        };
      });

      // Step 6: Analyze Performance
      await this.executeStep(workflow, 5, async () => {
        await this.delay(1000);
        return {
          analysis: "Performance metrics calculated",
          predictedEngagement: "High",
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

    step.status = "running";
    step.startTime = new Date();
    this.emitProgress(workflow.id);

    try {
      const output = await executor();
      step.output = output;
      step.status = "completed";
      step.endTime = new Date();

      workflow.completedSteps++;
      this.emitProgress(workflow.id);
    } catch (error) {
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
    ];
    const adCategories = [
      "product_demo",
      "tutorial",
      "customer_testimonial",
      "ugc_style",
      "before_after_transformation",
      "storytelling_narrative",
    ];
    const platforms = ["tiktok", "instagram_reels", "youtube_shorts"];

    const combinations = [];

    for (let i = 0; i < count; i++) {
      combinations.push({
        hookStyle: hookStyles[i % hookStyles.length],
        adCategory: adCategories[i % adCategories.length],
        platform: platforms[i % platforms.length],
        variationIndex: i + 1,
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
      currentStep: workflow.steps.find((step) => step.status === "running"),
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

    workflow.steps.forEach((step, index) => {
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
    const edges: WorkflowEdge[] = [
      {
        id: "start-first",
        source: "start",
        target: workflow.steps[0]?.id || "end",
        animated: workflow.steps[0]?.status === "running",
      },
    ];

    for (let i = 0; i < workflow.steps.length - 1; i++) {
      edges.push({
        id: `${workflow.steps[i].id}-${workflow.steps[i + 1].id}`,
        source: workflow.steps[i].id,
        target: workflow.steps[i + 1].id,
        animated: workflow.steps[i + 1]?.status === "running",
      });
    }

    if (workflow.steps.length > 0) {
      edges.push({
        id: `${workflow.steps[workflow.steps.length - 1].id}-end`,
        source: workflow.steps[workflow.steps.length - 1].id,
        target: "end",
        animated:
          workflow.status === "running" &&
          workflow.completedSteps === workflow.totalSteps - 1,
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
