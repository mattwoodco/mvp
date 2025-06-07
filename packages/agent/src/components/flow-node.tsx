import React from "react";
import { Handle, Position } from "reactflow";
import type { FlowNodeProps } from "./types";

export function AgentFlowNode({ id, data }: FlowNodeProps) {
  const getNodeStyles = () => {
    const baseStyles =
      "px-4 py-2 rounded-lg border-2 min-w-[160px] text-center shadow-md";

    switch (data.status) {
      case "pending":
        return `${baseStyles} bg-gray-100 border-gray-300 text-gray-700`;
      case "running":
        return `${baseStyles} bg-blue-100 border-blue-400 text-blue-800 animate-pulse`;
      case "completed":
        return `${baseStyles} bg-green-100 border-green-400 text-green-800`;
      case "failed":
        return `${baseStyles} bg-red-100 border-red-400 text-red-800`;
      default:
        return `${baseStyles} bg-gray-100 border-gray-300 text-gray-700`;
    }
  };

  const getNodeIcon = () => {
    switch (data.type) {
      case "agent":
        return "🤖";
      case "tool":
        return "🔧";
      case "decision":
        return "❓";
      case "start":
        return "▶️";
      case "end":
        return "🏁";
      default:
        return "⚡";
    }
  };

  const getStatusIcon = () => {
    switch (data.status) {
      case "pending":
        return "⏳";
      case "running":
        return "🔄";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "";
    }
  };

  return (
    <div className={getNodeStyles()}>
      {/* Input Handle */}
      {data.type !== "start" && (
        <Handle
          type="target"
          position={Position.Top}
          style={{
            background: "#555",
            width: 10,
            height: 10,
          }}
        />
      )}

      {/* Node Content */}
      <div className="flex flex-col items-center space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getNodeIcon()}</span>
          <span className="font-medium">{data.label}</span>
          <span className="text-sm">{getStatusIcon()}</span>
        </div>

        {/* Progress Bar */}
        {data.progress !== undefined && data.status === "running" && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${data.progress}%` }}
            />
          </div>
        )}

        {/* Error Message */}
        {data.error && (
          <div className="text-xs text-red-600 max-w-[140px] truncate">
            {data.error}
          </div>
        )}

        {/* Agent State Info */}
        {data.agentState && (
          <div className="text-xs text-gray-600 flex items-center space-x-1">
            <span>Errors: {data.agentState.errorCount}</span>
            <span>•</span>
            <span>Tools: {data.agentState.tools.length}</span>
          </div>
        )}
      </div>

      {/* Output Handle */}
      {data.type !== "end" && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: "#555",
            width: 10,
            height: 10,
          }}
        />
      )}
    </div>
  );
}
