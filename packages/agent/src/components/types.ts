import type { Edge, Node } from "reactflow";
import type { AgentState, AgentTask, WorkflowExecution } from "../types";

export interface FlowNodeProps {
  id: string;
  data: {
    label: string;
    status: "pending" | "running" | "completed" | "failed";
    progress?: number;
    agentState?: AgentState;
    taskResult?: any;
    error?: string;
    type: "agent" | "tool" | "decision" | "start" | "end";
  };
}

export interface WorkflowVisualizerProps {
  workflow: WorkflowExecution;
  onNodeClick?: (nodeId: string) => void;
  onTaskRetry?: (taskId: string) => void;
  onWorkflowPause?: () => void;
  onWorkflowResume?: () => void;
  onWorkflowCancel?: () => void;
  className?: string;
}

export interface FlowControlsProps {
  workflow: WorkflowExecution;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onRetry?: () => void;
}

export interface WorkflowProgressProps {
  workflow: WorkflowExecution;
  tasks?: AgentTask[];
  showDetails?: boolean;
}

export type FlowNode = Node<FlowNodeProps["data"]>;
export type FlowEdge = Edge;
