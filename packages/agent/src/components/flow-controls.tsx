import React from "react";
import type { FlowControlsProps } from "./types";

export function FlowControls({
  workflow,
  onPause,
  onResume,
  onCancel,
  onRetry,
}: FlowControlsProps) {
  const canPause = workflow.status === "running";
  const canResume =
    workflow.status === "pending" || workflow.status === "failed";
  const canCancel =
    workflow.status === "running" || workflow.status === "pending";
  const canRetry = workflow.status === "failed";

  return (
    <div className="flex items-center space-x-2">
      {canPause && onPause && (
        <button
          type="button"
          onClick={onPause}
          className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-sm font-medium"
        >
          ⏸️ Pause
        </button>
      )}

      {canResume && onResume && (
        <button
          type="button"
          onClick={onResume}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-medium"
        >
          ▶️ Resume
        </button>
      )}

      {canRetry && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm font-medium"
        >
          🔄 Retry
        </button>
      )}

      {canCancel && onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm font-medium"
        >
          ❌ Cancel
        </button>
      )}
    </div>
  );
}
