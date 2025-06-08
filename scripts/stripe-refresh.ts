#!/usr/bin/env node

import { execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function updateEnvFile(envPath: string, updates: Record<string, string>): void {
  if (!fs.existsSync(envPath)) {
    console.log(`⚠️  ${envPath} not found, skipping...`);
    return;
  }

  let envContent = fs.readFileSync(envPath, "utf8");

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Updated ${envPath}`);
}

function checkStripeCliInstalled(): boolean {
  try {
    execSync("stripe --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function checkStripeLoggedIn(): boolean {
  try {
    const output = execSync("stripe config --list", { encoding: "utf8" });
    if (output.includes("test_mode_api_key") && !output.includes("expired")) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function extractWebhookSecret(text: string): string | null {
  const cleanText = text.replace(/\n/g, " ").replace(/\s+/g, " ");

  const patterns = [
    /whsec_[a-zA-Z0-9]+/g,
    /webhook signing secret is (whsec_[a-zA-Z0-9]+)/i,
    /signing secret is (whsec_[a-zA-Z0-9]+)/i,
    /secret is (whsec_[a-zA-Z0-9]+)/i,
  ];

  for (const pattern of patterns) {
    const matches = cleanText.match(pattern);
    if (matches) {
      const lastMatch = matches[matches.length - 1];
      const secret = lastMatch.includes("whsec_")
        ? lastMatch.match(/whsec_[a-zA-Z0-9]+/)?.[0]
        : lastMatch;
      if (secret?.startsWith("whsec_")) {
        return secret;
      }
    }
  }

  return null;
}

async function refreshWebhookSecret(): Promise<string> {
  console.log("🔄 Refreshing webhook secret...");
  console.log("Starting webhook listener to capture secret...");
  console.log("");

  return new Promise((resolve, reject) => {
    const stripeProcess = spawn(
      "stripe",
      ["listen", "--forward-to", "localhost:3000/api/stripe/webhooks"],
      {
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    let webhookSecret: string | null = null;
    let timeoutId: NodeJS.Timeout;
    let outputReceived = false;
    let allOutput = "";

    timeoutId = setTimeout(() => {
      stripeProcess.kill();
      const secret = extractWebhookSecret(allOutput);
      if (secret) {
        resolve(secret);
      } else if (outputReceived) {
        reject(
          new Error(
            "Webhook secret not found in Stripe CLI output. Check the output above for errors.",
          ),
        );
      } else {
        reject(
          new Error(
            "No output received from Stripe CLI. Check your authentication with: stripe login",
          ),
        );
      }
    }, 15000);

    stripeProcess.stdout.on("data", (data) => {
      const output = data.toString();
      outputReceived = true;
      allOutput += output;
      console.log("📡 Stripe CLI output:", output.trim());

      const secret = extractWebhookSecret(output);
      if (secret && !webhookSecret) {
        webhookSecret = secret;
        console.log(
          `✅ Webhook secret captured: ${webhookSecret.substring(0, 12)}...`,
        );

        clearTimeout(timeoutId);
        stripeProcess.kill();
        resolve(webhookSecret);
      }
    });

    stripeProcess.stderr.on("data", (data) => {
      const output = data.toString();
      outputReceived = true;
      allOutput += output;
      console.log("⚠️  Stripe CLI info:", output.trim());

      if (
        output.includes("login") ||
        output.includes("expired") ||
        output.includes("authentication")
      ) {
        clearTimeout(timeoutId);
        stripeProcess.kill();
        reject(
          new Error(
            "Stripe CLI authentication expired. Please run: stripe login",
          ),
        );
        return;
      }

      const secret = extractWebhookSecret(output);
      if (secret && !webhookSecret) {
        webhookSecret = secret;
        console.log(
          `✅ Webhook secret captured: ${webhookSecret.substring(0, 12)}...`,
        );

        clearTimeout(timeoutId);
        stripeProcess.kill();
        resolve(webhookSecret);
      }
    });

    stripeProcess.on("error", (error) => {
      clearTimeout(timeoutId);
      reject(new Error(`Failed to start Stripe listener: ${error.message}`));
    });

    stripeProcess.on("close", (code) => {
      clearTimeout(timeoutId);
      if (!webhookSecret && code !== 0) {
        reject(
          new Error(
            `Stripe listener closed with code ${code}. Check authentication with: stripe login`,
          ),
        );
      }
    });
  });
}

async function main() {
  console.log("🔄 STRIPE WEBHOOK REFRESH");
  console.log("=========================");
  console.log("Refreshing webhook secret for development...");
  console.log("");

  if (!checkStripeCliInstalled()) {
    console.error("❌ Stripe CLI not installed.");
    console.error("Install with: brew install stripe/stripe-cli/stripe");
    process.exit(1);
  }

  if (!checkStripeLoggedIn()) {
    console.error("❌ Not logged in to Stripe CLI or login has expired.");
    console.error("Run: stripe login");
    process.exit(1);
  }

  console.log("✅ Stripe CLI authentication verified");

  try {
    const webhookSecret = await refreshWebhookSecret();

    console.log("\n📝 UPDATING ENVIRONMENT FILES");
    console.log("=============================");

    const webhookUpdate = {
      STRIPE_WEBHOOK_SECRET: webhookSecret,
    };

    updateEnvFile(".env.local", webhookUpdate);
    updateEnvFile(".env.dev", webhookUpdate);
    updateEnvFile(".env.prev", webhookUpdate);

    console.log("\n🎉 REFRESH COMPLETE!");
    console.log("====================");
    console.log("✅ Webhook secret refreshed and updated in environment files");
    console.log("");
    console.log("📋 SUMMARY:");
    console.log(`   New Webhook Secret: ${webhookSecret}`);
    console.log("");
    console.log("🚀 Ready to continue development with: bun run dev");
  } catch (error) {
    console.error("❌ Refresh failed:", (error as Error).message);
    console.error("");
    console.error("💡 TROUBLESHOOTING:");
    console.error("   1. Try: stripe login");
    console.error("   2. Check if port 3000 is available");
    console.error(
      "   3. Run manually: stripe listen --forward-to localhost:3000/api/stripe/webhooks",
    );
    process.exit(1);
  }
}

main();
