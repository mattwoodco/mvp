#!/usr/bin/env node

import { execSync } from "node:child_process";
import readline from "node:readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
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

function ensureTestMode(): boolean {
  const output = execSync("stripe config --list", { encoding: "utf8" });

  if (
    output.includes("live_mode_api_key") &&
    !output.includes("test_mode_api_key")
  ) {
    throw new Error(
      "WARNING: Detected live mode keys. This script only works with test keys for safety.",
    );
  }

  return true;
}

function getAllProducts(): string[] {
  try {
    console.log("🔍 Fetching all Stripe products...");
    const output = execSync("stripe products list --limit=100", {
      encoding: "utf8",
    });

    const productIds: string[] = [];
    const lines = output.split("\n");

    for (const line of lines) {
      const productMatch = line.match(/prod_[a-zA-Z0-9]+/);
      if (productMatch) {
        productIds.push(productMatch[0]);
      }
    }

    return [...new Set(productIds)];
  } catch (error) {
    throw new Error(`Failed to fetch products: ${(error as Error).message}`);
  }
}

function getAllPrices(): string[] {
  try {
    console.log("🔍 Fetching all Stripe prices...");
    const output = execSync("stripe prices list --limit=100", {
      encoding: "utf8",
    });

    const priceIds: string[] = [];
    const lines = output.split("\n");

    for (const line of lines) {
      const priceMatch = line.match(/price_[a-zA-Z0-9]+/);
      if (priceMatch) {
        priceIds.push(priceMatch[0]);
      }
    }

    return [...new Set(priceIds)];
  } catch (error) {
    throw new Error(`Failed to fetch prices: ${(error as Error).message}`);
  }
}

function deleteProduct(productId: string): boolean {
  try {
    console.log(`🗑️  Deleting product: ${productId}`);
    execSync(`stripe products delete ${productId}`, { stdio: "ignore" });
    console.log(`✅ Deleted product: ${productId}`);
    return true;
  } catch (error) {
    console.log(
      `❌ Failed to delete product ${productId}: ${(error as Error).message}`,
    );
    return false;
  }
}

async function main() {
  console.log("💥 STRIPE PRODUCTS NUKE");
  console.log("=======================");
  console.log(
    "This script will DELETE ALL Stripe products and prices in test mode.",
  );
  console.log("");
  console.log("⚠️  WARNING: This action cannot be undone!");
  console.log("⚠️  This script only works with TEST mode for safety.");
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

  try {
    ensureTestMode();
    console.log("✅ Verified test mode - safe to proceed");
  } catch (error) {
    console.error("❌", (error as Error).message);
    console.error("");
    console.error("💡 This script is designed for test environments only.");
    console.error(
      "   If you need to delete live products, do it manually from the Stripe Dashboard.",
    );
    process.exit(1);
  }

  try {
    const products = getAllProducts();
    const prices = getAllPrices();

    if (products.length === 0 && prices.length === 0) {
      console.log(
        "✨ No products or prices found. Your Stripe account is already clean!",
      );
      process.exit(0);
    }

    console.log("📋 FOUND:");
    console.log(`   ${products.length} products`);
    console.log(`   ${prices.length} prices`);
    console.log("");

    const confirm = await question(
      '🤔 Are you sure you want to delete ALL products and prices? (type "yes" to confirm): ',
    );

    if (confirm.toLowerCase() !== "yes") {
      console.log("❌ Operation cancelled. No changes made.");
      process.exit(0);
    }

    console.log("");
    console.log("🔥 STARTING DELETION...");
    console.log("======================");

    let deletedProducts = 0;
    let failedProducts = 0;

    for (const productId of products) {
      const success = deleteProduct(productId);
      if (success) {
        deletedProducts++;
      } else {
        failedProducts++;
      }
    }

    console.log("");
    console.log("🎉 NUKE COMPLETE!");
    console.log("================");
    console.log(`✅ Deleted: ${deletedProducts} products`);
    if (failedProducts > 0) {
      console.log(`❌ Failed: ${failedProducts} products`);
    }
    console.log(
      "💡 Note: Deleting products automatically deletes their associated prices",
    );
    console.log("");
    console.log("🚀 Your Stripe test environment is now clean!");
    console.log('   Run "bun run stripe:setup" to set up fresh products.');
  } catch (error) {
    console.error("❌ Nuke failed:", (error as Error).message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
