"use client";

import { Button } from "@mvp/ui/button";
import React, { useState, useEffect } from "react";

// Mock workflow data structure based on our agent types
interface WorkflowExecution {
  id: string;
  userId: string;
  name: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  nodes: Array<{
    id: string;
    type: "agent" | "tool" | "decision" | "start" | "end";
    name: string;
  }>;
  currentNode?: string;
  results: Record<string, any>;
  startTime: Date;
  endTime?: Date;
  error?: string;
  scriptVariations: Array<{
    id: string;
    script: string;
    score?: number;
    feedback?: string;
  }>;
}

interface AgentWorkflowDashboardProps {
  userId: string;
}

export function AgentWorkflowDashboard({
  userId,
}: AgentWorkflowDashboardProps) {
  const [workflows, setWorkflows] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowExecution | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate loading workflows
    setTimeout(() => {
      setWorkflows([
        {
          id: "workflow-1",
          userId,
          name: "TikTok Product Demo Scripts",
          status: "completed",
          nodes: [
            { id: "start", type: "start", name: "Start" },
            { id: "analyze", type: "tool", name: "Attribute Analysis" },
            { id: "generate", type: "agent", name: "Script Generation" },
            { id: "validate", type: "tool", name: "Quality Validation" },
            { id: "end", type: "end", name: "Complete" },
          ],
          currentNode: "end",
          results: {},
          startTime: new Date(Date.now() - 300000), // 5 minutes ago
          endTime: new Date(Date.now() - 60000), // 1 minute ago
          scriptVariations: [
            {
              id: "script-1",
              script: "🔥 Stop scrolling! This $5 gadget changed my life...",
              score: 87,
              feedback: "Strong hook, great urgency",
            },
            {
              id: "script-2",
              script:
                "POV: You discover the secret every creator wishes they knew...",
              score: 92,
              feedback: "Excellent narrative structure",
            },
            {
              id: "script-3",
              script:
                "Before I found this trick, I was wasting hours every day...",
              score: 78,
              feedback: "Good problem-solution format",
            },
          ],
        },
        {
          id: "workflow-2",
          userId,
          name: "Instagram Reels Testimonial",
          status: "running",
          nodes: [
            { id: "start", type: "start", name: "Start" },
            { id: "analyze", type: "tool", name: "Attribute Analysis" },
            { id: "generate", type: "agent", name: "Script Generation" },
            { id: "validate", type: "tool", name: "Quality Validation" },
            { id: "end", type: "end", name: "Complete" },
          ],
          currentNode: "generate",
          results: {},
          startTime: new Date(Date.now() - 120000), // 2 minutes ago
          scriptVariations: [],
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, [userId]);

  const getStatusColor = (status: WorkflowExecution["status"]) => {
    switch (status) {
      case "running":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getStatusIcon = (status: WorkflowExecution["status"]) => {
    switch (status) {
      case "running":
        return "🔄";
      case "completed":
        return "✅";
      case "failed":
        return "❌";
      case "cancelled":
        return "⏹️";
      default:
        return "⏳";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h2 className="text-xl font-semibold">Workflow Dashboard</h2>
        <p className="text-gray-600 text-sm mt-1">
          Monitor your agent workflows and generated scripts
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Workflow List */}
        <div className="w-1/2 border-r">
          <div className="p-4">
            <h3 className="font-medium text-gray-900 mb-3">Recent Workflows</h3>

            {workflows.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No workflows yet</p>
                <p className="text-sm">
                  Generate your first script to get started
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    onClick={() => setSelectedWorkflow(workflow)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedWorkflow?.id === workflow.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{workflow.name}</h4>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(workflow.status)}`}
                      >
                        <span>{getStatusIcon(workflow.status)}</span>
                        <span>{workflow.status}</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div>
                        Started: {workflow.startTime.toLocaleTimeString()}
                      </div>
                      {workflow.endTime && (
                        <div>
                          Completed: {workflow.endTime.toLocaleTimeString()}
                        </div>
                      )}
                      <div>Scripts: {workflow.scriptVariations.length}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Workflow Details */}
        <div className="w-1/2">
          {selectedWorkflow ? (
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  {selectedWorkflow.name}
                </h3>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(selectedWorkflow.status)}`}
                >
                  <span>{getStatusIcon(selectedWorkflow.status)}</span>
                  <span>{selectedWorkflow.status}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-600">
                    {selectedWorkflow.currentNode
                      ? selectedWorkflow.nodes.findIndex(
                          (n) => n.id === selectedWorkflow.currentNode,
                        ) + 1
                      : selectedWorkflow.nodes.length}{" "}
                    / {selectedWorkflow.nodes.length}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((selectedWorkflow.currentNode
                          ? selectedWorkflow.nodes.findIndex(
                              (n) => n.id === selectedWorkflow.currentNode,
                            ) + 1
                          : selectedWorkflow.nodes.length) /
                          selectedWorkflow.nodes.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Script Variations */}
              {selectedWorkflow.scriptVariations.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    Generated Scripts
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedWorkflow.scriptVariations.map((script, index) => (
                      <div
                        key={script.id}
                        className="p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">
                            Variation {index + 1}
                          </span>
                          {script.score && (
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-600">
                                Score:
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  script.score >= 85
                                    ? "text-green-600"
                                    : script.score >= 70
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                {script.score}/100
                              </span>
                            </div>
                          )}
                        </div>

                        <p className="text-sm text-gray-800 mb-2">
                          {script.script}
                        </p>

                        {script.feedback && (
                          <p className="text-xs text-gray-600 italic">
                            {script.feedback}
                          </p>
                        )}

                        <div className="mt-2 flex space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              navigator.clipboard.writeText(script.script)
                            }
                            className="text-xs"
                          >
                            📋 Copy
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs"
                          >
                            ✏️ Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error Display */}
              {selectedWorkflow.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <div className="text-sm font-medium text-red-800">Error</div>
                  <div className="text-xs text-red-700 mt-1">
                    {selectedWorkflow.error}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p>Select a workflow to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
