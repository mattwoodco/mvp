import { z } from "zod";
import type { ToolDefinition, ToolParameter } from "../types";

export interface ToolContext {
  userId: string;
  workflowId?: string;
  agentId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  metadata?: Record<string, any>;
}

export abstract class BaseTool {
  abstract readonly id: string;
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly category:
    | "analysis"
    | "generation"
    | "validation"
    | "optimization";
  abstract readonly parameters: ToolParameter[];

  abstract execute(
    params: Record<string, any>,
    context: ToolContext,
  ): Promise<ToolResult>;

  /**
   * Validate parameters against the tool's schema
   */
  validateParameters(params: Record<string, any>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    for (const param of this.parameters) {
      const value = params[param.name];

      // Check required parameters
      if (param.required && (value === undefined || value === null)) {
        errors.push(`Missing required parameter: ${param.name}`);
        continue;
      }

      // Skip validation for optional parameters that are not provided
      if (!param.required && (value === undefined || value === null)) {
        continue;
      }

      // Type validation
      if (!this.validateParameterType(value, param.type)) {
        errors.push(
          `Invalid type for parameter ${param.name}: expected ${param.type}`,
        );
      }

      // Enum validation
      if (param.enum && !param.enum.includes(String(value))) {
        errors.push(
          `Invalid value for parameter ${param.name}: must be one of ${param.enum.join(", ")}`,
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private validateParameterType(value: any, type: string): boolean {
    switch (type) {
      case "string":
        return typeof value === "string";
      case "number":
        return typeof value === "number" && !Number.isNaN(value);
      case "boolean":
        return typeof value === "boolean";
      case "object":
        return (
          typeof value === "object" && value !== null && !Array.isArray(value)
        );
      case "array":
        return Array.isArray(value);
      default:
        return true; // Unknown types pass validation
    }
  }

  /**
   * Get tool definition for agent use
   */
  getDefinition(): ToolDefinition {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      parameters: this.parameters,
      handler: async (params: Record<string, any>) => {
        throw new Error("Handler should be overridden in tool registry");
      },
      category: this.category,
      metadata: {
        version: "1.0.0",
        created: new Date().toISOString(),
      },
    };
  }

  /**
   * Create a safe execution wrapper with error handling
   */
  async safeExecute(
    params: Record<string, any>,
    context: ToolContext,
  ): Promise<ToolResult> {
    try {
      // Validate parameters first
      const validation = this.validateParameters(params);
      if (!validation.valid) {
        return {
          success: false,
          error: `Parameter validation failed: ${validation.errors.join(", ")}`,
        };
      }

      // Apply defaults for missing optional parameters
      const processedParams = this.applyDefaults(params);

      // Execute the tool
      const result = await this.execute(processedParams, context);

      return result;
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        metadata: {
          toolId: this.id,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }

  private applyDefaults(params: Record<string, any>): Record<string, any> {
    const result = { ...params };

    for (const param of this.parameters) {
      if (
        param.default !== undefined &&
        (result[param.name] === undefined || result[param.name] === null)
      ) {
        result[param.name] = param.default;
      }
    }

    return result;
  }
}

/**
 * Tool registry for managing and discovering tools
 */
export class ToolRegistry {
  private tools = new Map<string, BaseTool>();

  register(tool: BaseTool): void {
    this.tools.set(tool.id, tool);
  }

  unregister(toolId: string): void {
    this.tools.delete(toolId);
  }

  get(toolId: string): BaseTool | undefined {
    return this.tools.get(toolId);
  }

  getAll(): BaseTool[] {
    return Array.from(this.tools.values());
  }

  getByCategory(category: string): BaseTool[] {
    return this.getAll().filter((tool) => tool.category === category);
  }

  getDefinitions(): ToolDefinition[] {
    return this.getAll().map((tool) => tool.getDefinition());
  }

  async execute(
    toolId: string,
    params: Record<string, any>,
    context: ToolContext,
  ): Promise<ToolResult> {
    const tool = this.get(toolId);
    if (!tool) {
      return {
        success: false,
        error: `Tool not found: ${toolId}`,
      };
    }

    return tool.safeExecute(params, context);
  }
}

// Global tool registry instance
export const toolRegistry = new ToolRegistry();

/**
 * Utility function to create tool parameters with better type safety
 */
export function createToolParameter(config: {
  name: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required?: boolean;
  enum?: string[];
  default?: any;
}): ToolParameter {
  return {
    name: config.name,
    type: config.type,
    description: config.description,
    required: config.required ?? false,
    enum: config.enum,
    default: config.default,
  };
}

/**
 * Decorator for registering tools automatically
 */
export function registerTool(tool: BaseTool): void {
  toolRegistry.register(tool);
}
