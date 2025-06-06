"use client";

import { useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import { AgentProgress } from "@mvp/agent";
import { Card } from "@mvp/ui/card";
import { Progress } from "@mvp/ui/progress";

interface AgentFlowVisualizerProps {
  progress: AgentProgress;
  totalScripts: number;
}

const nodeTypes = {
  custom: ({ data }: { data: any }) => (
    <div className={`px-4 py-2 shadow-lg rounded-lg border-2 ${
      data.status === 'active' ? 'border-primary bg-primary/10' : 
      data.status === 'completed' ? 'border-green-500 bg-green-50' :
      data.status === 'error' ? 'border-red-500 bg-red-50' :
      'border-gray-300 bg-white'
    }`}>
      <div className="font-semibold text-sm">{data.label}</div>
      {data.details && (
        <div className="text-xs text-muted-foreground mt-1">{data.details}</div>
      )}
      {data.progress !== undefined && (
        <div className="mt-2">
          <Progress value={data.progress} className="h-1" />
        </div>
      )}
    </div>
  ),
};

export function AgentFlowVisualizer({ progress, totalScripts }: AgentFlowVisualizerProps) {
  const [nodes, setNodes] = useNodesState([]);
  const [edges, setEdges] = useEdgesState([]);

  useEffect(() => {
    // Update nodes based on progress
    const updatedNodes: Node[] = [
      {
        id: "1",
        type: "custom",
        position: { x: 50, y: 50 },
        data: {
          label: "Input Analysis",
          status: progress.stage === "analyzing" ? "active" : 
                  ["generating", "optimizing", "finalizing"].includes(progress.stage) ? "completed" : "idle",
          details: progress.stage === "analyzing" ? "Analyzing attributes..." : null,
        },
      },
      {
        id: "2",
        type: "custom",
        position: { x: 250, y: 50 },
        data: {
          label: "Script Generation",
          status: progress.stage === "generating" ? "active" : 
                  ["optimizing", "finalizing"].includes(progress.stage) ? "completed" : "idle",
          details: progress.stage === "generating" ? `${progress.currentScript}/${totalScripts} scripts` : null,
          progress: progress.stage === "generating" ? (progress.currentScript / totalScripts) * 100 : undefined,
        },
      },
      {
        id: "3",
        type: "custom",
        position: { x: 450, y: 50 },
        data: {
          label: "Optimization",
          status: progress.stage === "optimizing" ? "active" : 
                  progress.stage === "finalizing" ? "completed" : "idle",
          details: progress.stage === "optimizing" ? "Enhancing scripts..." : null,
        },
      },
      {
        id: "4",
        type: "custom",
        position: { x: 650, y: 50 },
        data: {
          label: "Finalization",
          status: progress.stage === "finalizing" ? "active" : "idle",
          details: progress.stage === "finalizing" ? "Preparing results..." : null,
        },
      },
    ];

    const updatedEdges: Edge[] = [
      {
        id: "e1-2",
        source: "1",
        target: "2",
        animated: progress.stage === "generating",
        style: { stroke: progress.stage !== "analyzing" ? "#10b981" : "#6b7280" },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: "e2-3",
        source: "2",
        target: "3",
        animated: progress.stage === "optimizing",
        style: { stroke: ["optimizing", "finalizing"].includes(progress.stage) ? "#10b981" : "#6b7280" },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
      {
        id: "e3-4",
        source: "3",
        target: "4",
        animated: progress.stage === "finalizing",
        style: { stroke: progress.stage === "finalizing" ? "#10b981" : "#6b7280" },
        markerEnd: { type: MarkerType.ArrowClosed },
      },
    ];

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [progress, totalScripts, setNodes, setEdges]);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Agent Workflow Progress</h3>
        <div className="h-[400px] w-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-2">Current Status</h3>
        <p className="text-muted-foreground">{progress.message}</p>
        {progress.stage === "generating" && (
          <div className="mt-4">
            <Progress value={(progress.currentScript / totalScripts) * 100} />
            <p className="text-sm text-muted-foreground mt-2">
              Generating script {progress.currentScript} of {totalScripts}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}