/**
 * Test Script - Validate prompt duplicate detection
 * This script demonstrates how the validation works by:
 * 1. Fetching prompts
 * 2. Saving them with verbose mode
 * 3. Fetching the same prompts again
 * 4. Showing that duplicates are detected and updated
 */

import "dotenv/config";
import mongoose from "mongoose";
import { fetchAllPromptSources } from "../scrapers";
import { savePrompts } from "../services/promptService";
import { connectDB } from "../config/database";
import { Prompt } from "../models/Prompt";

async function testPromptValidation() {
  console.log("🔍 Testing Prompt Validation & Duplicate Detection\n");
  console.log("=".repeat(60));

  try {
    // Connect to database
    console.log("\n📊 Connecting to database...");
    await connectDB();
    console.log("✅ Database connected\n");

    // Get initial count
    const initialCount = await Prompt.countDocuments();
    console.log(`📈 Current prompts in database: ${initialCount}\n`);

    // First fetch and save
    console.log("🔄 ROUND 1: Fetching and saving prompts...");
    console.log("-".repeat(60));
    const prompts1 = await fetchAllPromptSources(10);
    console.log(`✅ Fetched ${prompts1.length} prompts\n`);

    const results1 = await savePrompts(prompts1, { verbose: true });

    console.log("\n📊 Round 1 Results:");
    console.log(`   Created: ${results1.created}`);
    console.log(`   Updated: ${results1.updated}`);
    console.log(`   Skipped: ${results1.skipped}`);
    console.log(`   Failed: ${results1.failed}`);

    // Wait a moment
    console.log("\n⏳ Waiting 2 seconds before round 2...\n");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Second fetch and save (should detect duplicates)
    console.log("🔄 ROUND 2: Fetching same sources again...");
    console.log("-".repeat(60));
    const prompts2 = await fetchAllPromptSources(10);
    console.log(`✅ Fetched ${prompts2.length} prompts\n`);

    const results2 = await savePrompts(prompts2, { verbose: true });

    console.log("\n📊 Round 2 Results (should show mostly updates):");
    console.log(`   Created: ${results2.created}`);
    console.log(`   Updated: ${results2.updated}`);
    console.log(`   Skipped: ${results2.skipped}`);
    console.log(`   Failed: ${results2.failed}`);

    // Final count
    const finalCount = await Prompt.countDocuments();
    console.log(`\n📈 Final prompts in database: ${finalCount}`);
    console.log(`📊 Net new prompts: ${finalCount - initialCount}`);

    // Show validation effectiveness
    console.log("\n" + "=".repeat(60));
    console.log("✅ VALIDATION TEST SUMMARY");
    console.log("=".repeat(60));
    console.log(
      `Round 1: ${results1.created} created, ${results1.updated} updated`,
    );
    console.log(
      `Round 2: ${results2.created} created, ${results2.updated} updated`,
    );
    console.log(
      `\nDuplicate Detection Rate: ${
        results2.updated > 0
          ? `${Math.round((results2.updated / prompts2.length) * 100)}%`
          : "0%"
      }`,
    );

    if (results2.updated > results2.created) {
      console.log(
        "✅ Validation working correctly - more updates than creates in round 2",
      );
    } else {
      console.log("⚠️  Warning: Expected more updates in round 2");
    }

    // Show sample prompt with multiple platforms
    console.log("\n📝 Sample Cross-Platform Prompt:");
    const crossPlatform = await Prompt.findOne({
      crossPlatformCount: { $gt: 1 },
    });

    if (crossPlatform) {
      console.log(`   Text: ${crossPlatform.text.slice(0, 80)}...`);
      console.log(`   Platforms: ${crossPlatform.platforms.join(", ")}`);
      console.log(
        `   Cross-Platform Count: ${crossPlatform.crossPlatformCount}`,
      );
      console.log(`   Likes: ${crossPlatform.likes}`);
      console.log(`   Trend Score: ${crossPlatform.trendScore.toFixed(2)}`);
    } else {
      console.log("   No cross-platform prompts found yet");
    }
  } catch (error) {
    console.error("\n❌ Error in validation test:", error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.disconnect();
    console.log("\n🔌 Database connection closed");
  }
}

// Run if called directly
if (require.main === module) {
  testPromptValidation()
    .then(() => {
      console.log("\n✅ Validation test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Validation test failed:", error);
      process.exit(1);
    });
}

export default testPromptValidation;
