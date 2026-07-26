/**
 * Test Script - Fetch and display prompts from all sources
 */

import "dotenv/config";
import mongoose from "mongoose";
import { fetchAllPromptSources } from "../scrapers";
import { savePrompts } from "../services/promptService";
import { connectDB } from "../config/database";

async function testPromptFetch() {
  console.log("🚀 Starting prompt fetch from all sources...\n");

  try {
    // Connect to database
    console.log("📊 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected\n");

    // Fetch prompts
    const prompts = await fetchAllPromptSources(30);

    if (prompts.length === 0) {
      console.warn(
        "⚠️  No prompts fetched. Websites may be blocking requests or temporarily unavailable.\n",
      );
      return;
    }

    console.log(`✅ Successfully fetched ${prompts.length} prompts\n`);

    // Save prompts to database
    console.log("💾 Saving prompts to database...");
    const saveResults = await savePrompts(prompts, { verbose: false });
    
    console.log(`\n✅ Save completed:`);
    console.log(`   Total: ${saveResults.total}`);
    console.log(`   Created: ${saveResults.created} new prompts`);
    console.log(`   Updated: ${saveResults.updated} existing prompts`);
    console.log(`   Skipped: ${saveResults.skipped} (validation failed)`);
    console.log(`   Failed: ${saveResults.failed}\n`);
    
    // Show errors if any
    if (saveResults.errors.length > 0) {
      console.log(`⚠️  Errors/Skipped (${saveResults.errors.length}):`);
      saveResults.errors.slice(0, 5).forEach((error) => {
        console.log(`   - ${error.id}: ${error.reason}`);
      });
      if (saveResults.errors.length > 5) {
        console.log(`   ... and ${saveResults.errors.length - 5} more`);
      }
      console.log();
    }

    // Group by source
    const bySource = prompts.reduce(
      (acc, p) => {
        acc[p.source] = (acc[p.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("📊 Prompts by source:");
    Object.entries(bySource).forEach(([source, count]) => {
      console.log(`   ${source}: ${count}`);
    });

    // Group by model (if available)
    const byModel = prompts
      .filter((p) => p.model)
      .reduce(
        (acc, p) => {
          acc[p.model!] = (acc[p.model!] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      );

    if (Object.keys(byModel).length > 0) {
      console.log("\n🎨 Prompts by model:");
      Object.entries(byModel).forEach(([model, count]) => {
        console.log(`   ${model}: ${count}`);
      });
    }

    // Show sample prompts from saved results
    if (saveResults.prompts.length > 0) {
      console.log("\n📝 Sample saved prompts:");
      saveResults.prompts.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. [${p.platforms.join(", ")}${p.aiTools.length ? ` - ${p.aiTools.join(", ")}` : ""}]`);
        console.log(`   Prompt: ${p.text.slice(0, 100)}${p.text.length > 100 ? "..." : ""}`);
        console.log(`   Trend Score: ${p.trendScore.toFixed(2)}`);
        console.log(`   Likes: ${p.likes}`);
        console.log(`   Tags: ${p.tags.slice(0, 5).join(", ") || "N/A"}`);
        console.log(`   Preview: ${p.previewUrl}`);
        console.log(`   Approved: ${p.isApproved ? "Yes" : "No"}`);
      });
    }
  } catch (error) {
    console.error("❌ Error fetching prompts:", error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log("\n🔌 Database connection closed");
  }
}

// Run if called directly
if (require.main === module) {
  testPromptFetch()
    .then(() => {
      console.log("\n✅ Test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Test failed:", error);
      process.exit(1);
    });
}

export default testPromptFetch;
