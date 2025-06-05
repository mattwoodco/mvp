#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");

const ENV_MAPPINGS: Record<string, string | string[]> = {
  ".env.prod": "production",
  ".env.prev": "preview",
  ".env.dev": "development",
  ".env": ["production", "preview", "development"],
};

interface VercelConfig {
  vercelToken: string;
  vercelProjectId: string;
}

function loadVercelConfig(): VercelConfig {
  const envFiles: string[] = [".env.local", ".env", ".env.dev"];
  let vercelToken: string | undefined = process.env.VERCEL_TOKEN;
  let vercelProjectId: string | undefined = process.env.VERCEL_PROJECT_ID;

  for (const filename of envFiles) {
    const filepath = join(rootDir, filename);
    const vars = parseEnvFile(filepath);

    if (!vercelToken && vars.VERCEL_TOKEN) {
      vercelToken = vars.VERCEL_TOKEN;
    }
    if (!vercelProjectId && vars.VERCEL_PROJECT_ID) {
      vercelProjectId = vars.VERCEL_PROJECT_ID;
    }

    if (vercelToken && vercelProjectId) break;
  }

  if (!vercelToken || !vercelProjectId) {
    console.error(
      "Missing VERCEL_TOKEN or VERCEL_PROJECT_ID in environment variables or .env files",
    );
    process.exit(1);
  }

  return { vercelToken, vercelProjectId };
}

function parseEnvFile(filepath: string): Record<string, string> {
  if (!existsSync(filepath)) return {};

  const content = readFileSync(filepath, "utf8");
  const vars: Record<string, string> = {};

  for (const rawLine of content.split("\n")) {
    const line = rawLine.trim();
    if (line && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        let value = valueParts.join("=").trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        vars[key.trim()] = value;
      }
    }
  }

  return vars;
}

interface VercelEnvVar {
  id: string;
  key: string;
  target: string[];
}

interface VercelEnvResponse {
  envs?: VercelEnvVar[];
}

async function upsertEnvVar(
  key: string,
  value: string,
  target: string,
  vercelProjectId: string,
  vercelToken: string,
): Promise<boolean> {
  const url = `https://api.vercel.com/v10/projects/${vercelProjectId}/env`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${vercelToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        key,
        value,
        target: [target],
        type: "encrypted",
      }),
    });

    if (response.ok) {
      return true;
    }

    if (response.status === 400 || response.status === 409) {
      const existingVars = await fetch(`${url}`, {
        headers: { Authorization: `Bearer ${vercelToken}` },
      });
      const vars: VercelEnvResponse = await existingVars.json();
      const existing = vars.envs?.find(
        (env) => env.key === key && env.target.includes(target),
      );

      if (existing) {
        const updateResponse = await fetch(`${url}/${existing.id}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value }),
        });
        return updateResponse.ok;
      }
    }

    const errorText = await response.text();
    console.error(
      `❌ ${key} - Status: ${response.status}, Error: ${errorText}`,
    );
    return false;
  } catch (error) {
    console.error(
      `Failed to upsert ${key} for ${target}:`,
      (error as Error).message,
    );
    return false;
  }
}

async function syncEnvs(): Promise<void> {
  console.log("🔄 Syncing environment variables to Vercel...\n");

  const { vercelToken, vercelProjectId } = loadVercelConfig();
  console.log(`🔑 Using Project ID: ${vercelProjectId}`);
  console.log(`🔑 Token length: ${vercelToken.length} chars\n`);

  for (const [filename, targets] of Object.entries(ENV_MAPPINGS)) {
    const filepath = join(rootDir, filename);
    const vars = parseEnvFile(filepath);

    if (Object.keys(vars).length === 0) {
      console.log(`⚠️  ${filename} not found or empty, skipping`);
      continue;
    }

    const targetArray = Array.isArray(targets) ? targets : [targets];

    for (const target of targetArray) {
      console.log(`📁 Processing ${filename} → ${target}`);

      for (const [key, value] of Object.entries(vars)) {
        if (key === "VERCEL_TOKEN" || key === "VERCEL_PROJECT_ID") continue;
        const success = await upsertEnvVar(
          key,
          value,
          target,
          vercelProjectId,
          vercelToken,
        );
        console.log(`${success ? "✅" : "❌"} ${key}`);
      }

      console.log();
    }
  }

  console.log("🎉 Environment sync complete!");
}

syncEnvs().catch(console.error);
