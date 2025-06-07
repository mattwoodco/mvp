import React from "react";
import type { WorkflowProgressProps } from "./types";

export function WorkflowProgress({
  workflow,
  tasks = [],
  showDetails = false,
}: WorkflowProgressProps) {
  const completedNodes = workflow.nodes.filter((node, index) => {
    const currentIndex = workflow.nodes.findIndex(
      (n) => n.id === workflow.currentNode,
    );
    return index < currentIndex;
  });

  const totalNodes = workflow.nodes.length;
  const progressPercentage = (completedNodes.length / totalNodes) * 100;

  const formatDuration = (startTime: Date, endTime?: Date) => {
    const end = endTime || new Date();
    const duration = end.getTime() - startTime.getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="p-4 space-y-4">
      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Progress</h3>
          <span className="text-sm text-gray-600">
            {completedNodes.length} / {totalNodes}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <div className="text-xs text-gray-500 mt-1">
          {Math.round(progressPercentage)}% complete
        </div>
      </div>

      {/* Status Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Status:</span>
          <span
            className={`text-sm font-medium ${
              workflow.status === "running"
                ? "text-blue-600"
                : workflow.status === "completed"
                  ? "text-green-600"
                  : workflow.status === "failed"
                    ? "text-red-600"
                    : "text-gray-600"
            }`}
          >
            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Duration:</span>
          <span className="text-sm text-gray-900">
            {formatDuration(workflow.startTime, workflow.endTime)}
          </span>
        </div>

        {workflow.currentNode && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Node:</span>
            <span className="text-sm text-gray-900 truncate max-w-[100px]">
              {workflow.nodes.find((n) => n.id === workflow.currentNode)
                ?.name || "Unknown"}
            </span>
          </div>
        )}
      </div>

      {/* Detailed Node List */}
      {showDetails && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Nodes</h4>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {workflow.nodes.map((node, index) => {
              const isCompleted = completedNodes.some((c) => c.id === node.id);
              const isCurrent = workflow.currentNode === node.id;

              return (
                <div
                  key={node.id}
                  className={`flex items-center space-x-2 p-2 rounded text-sm ${
                    isCurrent
                      ? "bg-blue-50 border border-blue-200"
                      : isCompleted
                        ? "bg-green-50"
                        : "bg-gray-50"
                  }`}
                >
                  <span className="text-xs">
                    {isCurrent ? "🔄" : isCompleted ? "✅" : "⏳"}
                  </span>
                  <span className="flex-1 truncate">{node.name}</span>
                  <span className="text-xs text-gray-500">{node.type}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Details */}
      {showDetails && tasks.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Tasks</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {tasks.slice(-5).map((task) => (
              <div
                key={task.id}
                className={`flex items-center space-x-2 p-2 rounded text-xs ${
                  task.status === "running"
                    ? "bg-blue-50"
                    : task.status === "completed"
                      ? "bg-green-50"
                      : task.status === "failed"
                        ? "bg-red-50"
                        : "bg-gray-50"
                }`}
              >
                <span>
                  {task.status === "running"
                    ? "🔄"
                    : task.status === "completed"
                      ? "✅"
                      : task.status === "failed"
                        ? "❌"
                        : "⏳"}
                </span>
                <span className="flex-1 truncate">{task.type}</span>
                {task.endTime && task.startTime && (
                  <span className="text-gray-500">
                    {formatDuration(task.startTime, task.endTime)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {workflow.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <div className="text-sm font-medium text-red-800">Error</div>
          <div className="text-xs text-red-700 mt-1">{workflow.error}</div>
        </div>
      )}
    </div>
  );
}
