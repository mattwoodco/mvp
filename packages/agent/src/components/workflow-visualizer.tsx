import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  type NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";

import { FlowControls } from "./flow-controls";
import { AgentFlowNode } from "./flow-node";
import type { FlowEdge, FlowNode, WorkflowVisualizerProps } from "./types";
import { WorkflowProgress } from "./workflow-progress";

// Define custom node types
const nodeTypes: NodeTypes = {
  agentNode: AgentFlowNode,
};

export function WorkflowVisualizer({
  workflow,
  onNodeClick,
  onTaskRetry,
  onWorkflowPause,
  onWorkflowResume,
  onWorkflowCancel,
  className = "",
}: WorkflowVisualizerProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Convert workflow nodes to React Flow nodes
  const initialNodes: FlowNode[] = useMemo(() => {
    return workflow.nodes.map((node, index) => ({
      id: node.id,
      type: "agentNode",
      position: {
        x: (index % 3) * 250,
        y: Math.floor(index / 3) * 150,
      },
      data: {
        label: node.name,
        status: workflow.currentNode === node.id ? "running" : "pending",
        type: node.type as any,
        progress: workflow.currentNode === node.id ? 50 : undefined,
      },
    }));
  }, [workflow.nodes, workflow.currentNode]);

  // Create edges based on workflow connections
  const initialEdges: FlowEdge[] = useMemo(() => {
    const edges: FlowEdge[] = [];
    workflow.nodes.forEach((node, index) => {
      if (index < workflow.nodes.length - 1) {
        edges.push({
          id: `${node.id}-${workflow.nodes[index + 1].id}`,
          source: node.id,
          target: workflow.nodes[index + 1].id,
          type: "smoothstep",
          animated: workflow.currentNode === node.id,
          style: {
            strokeWidth: 2,
            stroke: workflow.currentNode === node.id ? "#3b82f6" : "#94a3b8",
          },
        });
      }
    });
    return edges;
  }, [workflow.nodes, workflow.currentNode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node.id);
      onNodeClick?.(node.id);
    },
    [onNodeClick],
  );

  // Update node status when workflow changes
  React.useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status:
            workflow.currentNode === node.id
              ? "running"
              : workflow.status === "completed"
                ? "completed"
                : workflow.status === "failed"
                  ? "failed"
                  : "pending",
          progress: workflow.currentNode === node.id ? 75 : undefined,
        },
      })),
    );
  }, [workflow.currentNode, workflow.status, setNodes]);

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* Workflow Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold">{workflow.name}</h2>
          <div className="flex items-center space-x-2">
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                workflow.status === "running"
                  ? "bg-blue-100 text-blue-800"
                  : workflow.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : workflow.status === "failed"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {workflow.status.toUpperCase()}
            </div>
            {workflow.startTime && (
              <span className="text-sm text-gray-500">
                Started: {new Date(workflow.startTime).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        <FlowControls
          workflow={workflow}
          onPause={onWorkflowPause}
          onResume={onWorkflowResume}
          onCancel={onWorkflowCancel}
          onRetry={
            onTaskRetry ? () => onTaskRetry(selectedNode || "") : undefined
          }
        />
      </div>

      {/* Main Flow Area */}
      <div className="flex flex-1">
        {/* React Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{
              padding: 0.2,
            }}
          >
            <Controls />
            <MiniMap />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>

        {/* Sidebar with Progress */}
        <div className="w-80 border-l bg-gray-50">
          <WorkflowProgress workflow={workflow} showDetails={true} />
        </div>
      </div>

      {/* Error Display */}
      {workflow.error && (
        <div className="p-4 bg-red-50 border-t border-red-200">
          <div className="flex items-center space-x-2">
            <span className="text-red-600">❌</span>
            <span className="font-medium text-red-800">Workflow Error:</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{workflow.error}</p>
        </div>
      )}
    </div>
  );
}
