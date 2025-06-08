#!/usr/bin/env node

import { type ChildProcess, execSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

function createEnvFileIfNotExists(envPath: string): void {
  if (!fs.existsSync(envPath)) {
    console.log(`📝 Creating ${envPath}...`);
    if (fs.existsSync("env.example")) {
      fs.copyFileSync("env.example", envPath);
    } else {
      fs.writeFileSync(envPath, "# Environment variables\n");
    }
  }
}

function updateEnvFile(envPath: string, updates: Record<string, string>): void {
  createEnvFileIfNotExists(envPath);

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

async function handleStripeLogin(): Promise<void> {
  console.log("\n🔐 STRIPE CLI AUTHENTICATION");
  console.log("==============================");
  console.log(
    "You need to authenticate with Stripe CLI to create products and prices.",
  );
  console.log("");

  const shouldLogin = await question(
    "Would you like to login to Stripe CLI now? (y/n): ",
  );

  if (
    shouldLogin.toLowerCase() !== "y" &&
    shouldLogin.toLowerCase() !== "yes"
  ) {
    console.log("❌ Stripe CLI authentication is required to create products.");
    console.log(
      'You can run "stripe login" manually and then run this script again.',
    );
    process.exit(1);
  }

  console.log("\n🌐 Opening Stripe authentication...");
  console.log("");
  console.log("A pairing code will be displayed below.");
  console.log(
    "Please follow the instructions to authenticate in your browser.",
  );
  console.log("");

  try {
    execSync("stripe login", { stdio: "inherit" });
    console.log("\n✅ Successfully authenticated with Stripe CLI!");

    if (!checkStripeLoggedIn()) {
      console.error("❌ Authentication verification failed. Please try again.");
      process.exit(1);
    }
  } catch {
    console.error("❌ Failed to authenticate with Stripe CLI.");
    console.error('Please run "stripe login" manually and try again.');
    process.exit(1);
  }
}

async function promptForApiKeys(): Promise<{
  secretKey: string;
  publishableKey: string;
}> {
  console.log("\n🔑 API KEY SETUP");
  console.log("==================");
  console.log("You need to get your API keys from the Stripe Dashboard:");
  console.log("");
  console.log("📱 Go to: https://dashboard.stripe.com/test/apikeys");
  console.log("");
  console.log('1. Copy your "Secret key" (starts with sk_test_...)');
  console.log('2. Copy your "Publishable key" (starts with pk_test_...)');
  console.log("");

  const secretKey = await question(
    "🔐 Enter your Stripe Secret Key (sk_test_...): ",
  );
  if (!secretKey.startsWith("sk_test_")) {
    console.log(
      "⚠️  Warning: Secret key should start with sk_test_ for test mode",
    );
  }

  const publishableKey = await question(
    "🗝️  Enter your Stripe Publishable Key (pk_test_...): ",
  );
  if (!publishableKey.startsWith("pk_test_")) {
    console.log(
      "⚠️  Warning: Publishable key should start with pk_test_ for test mode",
    );
  }

  return { secretKey, publishableKey };
}

async function createStripeProducts(): Promise<{
  basicPriceId: string;
  premiumPriceId: string;
}> {
  console.log("\n📦 CREATING STRIPE PRODUCTS & PRICES");
  console.log("=====================================");

  try {
    console.log("📦 Creating Basic Membership product...");
    const basicProductOutput = execSync(
      `stripe products create --name="Basic Membership" --description="Essential features for individuals - $5/month"`,
      { encoding: "utf8" },
    );

    const basicProductMatch = basicProductOutput.match(/prod_[a-zA-Z0-9]+/);
    if (!basicProductMatch) {
      throw new Error("Could not extract product ID from Stripe CLI output");
    }
    const basicProductId = basicProductMatch[0];
    console.log(`✅ Basic Product ID: ${basicProductId}`);

    console.log("💰 Creating Basic price ($5/mo)...");
    const basicPriceOutput = execSync(
      `stripe prices create --unit-amount=500 --currency=usd --product=${basicProductId} --recurring.interval=month`,
      { encoding: "utf8" },
    );

    const basicPriceMatch = basicPriceOutput.match(/price_[a-zA-Z0-9]+/);
    if (!basicPriceMatch) {
      throw new Error("Could not extract price ID from Stripe CLI output");
    }
    const basicPriceId = basicPriceMatch[0];
    console.log(`✅ Basic Price ID: ${basicPriceId}`);

    console.log("📦 Creating Premium Membership product...");
    const premiumProductOutput = execSync(
      `stripe products create --name="Premium Membership" --description="Advanced features for power users - $20/month"`,
      { encoding: "utf8" },
    );

    const premiumProductMatch = premiumProductOutput.match(/prod_[a-zA-Z0-9]+/);
    if (!premiumProductMatch) {
      throw new Error("Could not extract product ID from Stripe CLI output");
    }
    const premiumProductId = premiumProductMatch[0];
    console.log(`✅ Premium Product ID: ${premiumProductId}`);

    console.log("💰 Creating Premium price ($20/mo)...");
    const premiumPriceOutput = execSync(
      `stripe prices create --unit-amount=2000 --currency=usd --product=${premiumProductId} --recurring.interval=month`,
      { encoding: "utf8" },
    );

    const premiumPriceMatch = premiumPriceOutput.match(/price_[a-zA-Z0-9]+/);
    if (!premiumPriceMatch) {
      throw new Error("Could not extract price ID from Stripe CLI output");
    }
    const premiumPriceId = premiumPriceMatch[0];
    console.log(`✅ Premium Price ID: ${premiumPriceId}`);

    return {
      basicPriceId,
      premiumPriceId,
    };
  } catch (error) {
    console.error(
      "❌ Error creating Stripe products:",
      (error as Error).message,
    );
    throw error;
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

async function getWebhookSecret(): Promise<string> {
  console.log("\n🎣 WEBHOOK SECRET SETUP");
  console.log("=======================");
  console.log("Setting up webhook secret for development...");
  console.log("");

  return new Promise((resolve, reject) => {
    console.log("🔄 Starting Stripe webhook listener to capture secret...");

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
          `✅ Webhook Secret captured: ${webhookSecret.substring(0, 12)}...`,
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
            "Stripe CLI authentication expired. Please run stripe login.",
          ),
        );
        return;
      }

      const secret = extractWebhookSecret(output);
      if (secret && !webhookSecret) {
        webhookSecret = secret;
        console.log(
          `✅ Webhook Secret captured: ${webhookSecret.substring(0, 12)}...`,
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
        reject(new Error("Stripe listener closed unexpectedly"));
      }
    });
  });
}

async function main() {
  console.log("🚀 STRIPE SETUP WIZARD");
  console.log("======================");
  console.log(
    "This script will set up Stripe products, prices, and environment variables.",
  );
  console.log("");

  if (!checkStripeCliInstalled()) {
    console.error("❌ Stripe CLI not installed.");
    console.error("Install with: brew install stripe/stripe-cli/stripe");
    console.error("Or visit: https://stripe.com/docs/stripe-cli");
    process.exit(1);
  }

  if (!checkStripeLoggedIn()) {
    await handleStripeLogin();
  } else {
    console.log("✅ Stripe CLI authentication verified");
  }

  try {
    const { secretKey, publishableKey } = await promptForApiKeys();
    const { basicPriceId, premiumPriceId } = await createStripeProducts();
    const webhookSecret = await getWebhookSecret();

    console.log("\n📝 UPDATING ENVIRONMENT FILES");
    console.log("=============================");

    const testStripeConfig = {
      USE_LIVE_STRIPE: "false",
      STRIPE_SECRET_KEY: secretKey,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publishableKey,
      STRIPE_WEBHOOK_SECRET: webhookSecret,
      STRIPE_BASIC_PRICE_ID: basicPriceId,
      STRIPE_PREMIUM_PRICE_ID: premiumPriceId,
    };

    updateEnvFile(".env.local", testStripeConfig);
    updateEnvFile(".env.dev", testStripeConfig);
    updateEnvFile(".env.prev", testStripeConfig);

    const prodConfig = {
      ...testStripeConfig,
      STRIPE_LIVE_SECRET_KEY: "sk_live_your_live_secret_key_here",
      NEXT_PUBLIC_STRIPE_LIVE_PUBLISHABLE_KEY:
        "pk_live_your_live_publishable_key_here",
      STRIPE_LIVE_WEBHOOK_SECRET: "whsec_your_live_webhook_secret_here",
      STRIPE_LIVE_BASIC_PRICE_ID: "price_your_live_basic_price_id_here",
      STRIPE_LIVE_PREMIUM_PRICE_ID: "price_your_live_premium_price_id_here",
    };

    updateEnvFile(".env.prod", prodConfig);
    updateEnvFile(".env", { USE_LIVE_STRIPE: "false" });

    console.log("\n🎉 SETUP COMPLETE!");
    console.log("==================");
    console.log("✅ Stripe products and prices created");
    console.log("✅ Webhook secret captured and configured");
    console.log(
      "✅ Test environment files updated (.env.local, .env.dev, .env.prev)",
    );
    console.log("✅ Production environment template created (.env.prod)");
    console.log("");
    console.log("📋 SUMMARY:");
    console.log(`   Basic Price ID: ${basicPriceId}`);
    console.log(`   Premium Price ID: ${premiumPriceId}`);
    console.log(`   Webhook Secret: ${webhookSecret}`);
    console.log("");
    console.log("🔧 NEXT STEPS:");
    console.log(
      "   1. Run: bun run dev (webhook listener will start automatically)",
    );
    console.log("   2. If webhook stops working, run: bun run stripe:refresh");
    console.log("   3. For production, update .env.prod with live Stripe keys");
    console.log(
      "   4. Set USE_LIVE_STRIPE=true in production to use live mode",
    );
    console.log("");
    console.log("🚀 Everything is ready! Start development with: bun run dev");
  } catch (error) {
    console.error("❌ Setup failed:", (error as Error).message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
