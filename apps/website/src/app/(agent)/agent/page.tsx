import { auth } from "@mvp/auth/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { AgentWorkflowDashboard } from "./components/agent-dashboard";
import { ScriptGenerationForm } from "./components/script-generation-form";

export default async function AgentPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                AI Video Script Agent
              </h1>
              <p className="text-gray-600 mt-1">
                Generate optimized video script variations with AI-powered
                workflow automation
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {session.user.name || session.user.email}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Script Generation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Generate Script Variations
              </h2>
              <ScriptGenerationForm userId={session.user.id} />
            </div>
          </div>

          {/* Right Column - Workflow Dashboard */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <AgentWorkflowDashboard userId={session.user.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
