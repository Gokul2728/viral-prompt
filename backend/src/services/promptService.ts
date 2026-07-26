/**
 * Prompt Service
 * Handles saving and updating prompts in the database
 */

import { Prompt, IPrompt } from "../models/Prompt";
import { PromptEntry, calculatePromptVelocity } from "../scrapers";

/**
 * Check if a prompt already exists in the database
 * Checks by text, scraper ID, and image URL
 */
async function checkPromptExists(entry: PromptEntry): Promise<IPrompt | null> {
  // Check by exact text match (case-insensitive, trimmed)
  const normalizedText = entry.prompt.trim();
  const byText = await Prompt.findOne({
    text: { $regex: new RegExp(`^${normalizedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, "i") },
  });
  
  if (byText) {
    return byText;
  }
  
  // Check by scraper ID in metadata
  if (entry.id) {
    const byScraperId = await Prompt.findOne({
      "metadata.scraperId": entry.id,
    });
    
    if (byScraperId) {
      return byScraperId;
    }
  }
  
  // Check by image URL (to catch same image with different prompt text)
  if (entry.imageUrl) {
    const byImageUrl = await Prompt.findOne({
      previewUrl: entry.imageUrl,
    });
    
    if (byImageUrl) {
      return byImageUrl;
    }
  }
  
  return null;
}

/**
 * Map PromptEntry from scrapers to Prompt model
 */
function mapPromptEntryToModel(entry: PromptEntry): Partial<IPrompt> {
  return {
    text: entry.prompt,
    type: "image", // Default to image since scrapers fetch image prompts
    previewUrl: entry.imageUrl,
    previewType: "image",
    thumbnailUrl: entry.thumbnailUrl || entry.imageUrl,
    
    // Metadata
    platforms: [entry.source],
    aiTools: entry.model ? [entry.model] : [],
    tags: entry.tags || [],
    
    // Engagement - map likes to multiple engagement metrics
    likes: entry.likes,
    fires: 0, // User-generated engagements (not available from scrapers)
    wows: 0,
    copies: 0,
    generates: 0,
    
    // Calculate trend score based on engagement and recency
    trendScore: calculatePromptVelocity(entry),
    
    // Tracking
    firstSeenAt: entry.createdAt ? new Date(entry.createdAt) : new Date(),
    crossPlatformCount: 1,
    creatorCount: entry.author ? 1 : 0,
    engagementVelocity: calculatePromptVelocity(entry),
    
    // Source info
    sourceUrl: `https://${entry.source}.com/${entry.id}`, // Simplified source URL
    isApproved: false, // Requires manual approval
    
    // Store original data in metadata
    metadata: {
      scraperId: entry.id,
      source: entry.source,
      author: entry.author,
      negativePrompt: entry.negativePrompt,
      originalLikes: entry.likes,
    },
  };
}

/**
 * Save a single prompt to the database
 * Checks for duplicates and updates if exists
 */
export async function savePrompt(
  entry: PromptEntry,
  options: { verbose?: boolean } = {}
): Promise<{ prompt: IPrompt | null; isNew: boolean; reason?: string }> {
  try {
    // Validate entry has required fields
    if (!entry.prompt || !entry.prompt.trim()) {
      if (options.verbose) {
        console.warn(`⚠️  Skipping prompt ${entry.id}: Empty prompt text`);
      }
      return { prompt: null, isNew: false, reason: "Empty prompt text" };
    }
    
    if (!entry.imageUrl) {
      if (options.verbose) {
        console.warn(`⚠️  Skipping prompt ${entry.id}: Missing image URL`);
      }
      return { prompt: null, isNew: false, reason: "Missing image URL" };
    }
    
    // Check if prompt already exists
    const existing = await checkPromptExists(entry);

    if (existing) {
      if (options.verbose) {
        console.log(`♻️  Updating existing prompt: ${existing._id}`);
      }
      
      // Update existing prompt with new data
      let updated = false;
      
      // Update likes if higher
      if (entry.likes > existing.likes) {
        existing.likes = entry.likes;
        updated = true;
      }
      
      // Update trend score if higher
      const newTrendScore = calculatePromptVelocity(entry);
      if (newTrendScore > existing.trendScore) {
        existing.trendScore = newTrendScore;
        existing.engagementVelocity = newTrendScore;
        updated = true;
      }
      
      // Add source if not already present
      if (!existing.platforms.includes(entry.source)) {
        existing.platforms.push(entry.source);
        existing.crossPlatformCount = existing.platforms.length;
        updated = true;
        
        if (options.verbose) {
          console.log(`  ➕ Added platform: ${entry.source}`);
        }
      }
      
      // Add AI tool if available and not present
      if (entry.model && !existing.aiTools.includes(entry.model)) {
        existing.aiTools.push(entry.model);
        updated = true;
        
        if (options.verbose) {
          console.log(`  ➕ Added AI tool: ${entry.model}`);
        }
      }
      
      // Merge tags
      const newTags = entry.tags.filter((tag) => !existing.tags.includes(tag));
      if (newTags.length > 0) {
        existing.tags.push(...newTags);
        updated = true;
        
        if (options.verbose) {
          console.log(`  ➕ Added ${newTags.length} new tags`);
        }
      }
      
      // Update metadata with latest scraper info
      if (!existing.metadata) {
        existing.metadata = {};
      }
      existing.metadata.lastScrapedFrom = entry.source;
      existing.metadata.lastScrapedAt = new Date().toISOString();
      
      if (updated) {
        await existing.save();
        if (options.verbose) {
          console.log(`  ✅ Updated successfully`);
        }
      } else if (options.verbose) {
        console.log(`  ℹ️  No updates needed`);
      }
      
      return { prompt: existing, isNew: false };
    }

    // Create new prompt
    if (options.verbose) {
      console.log(`✨ Creating new prompt from ${entry.source}: ${entry.id}`);
    }
    
    const promptData = mapPromptEntryToModel(entry);
    const prompt = new Prompt(promptData);
    await prompt.save();
    
    if (options.verbose) {
      console.log(`  ✅ Created successfully: ${prompt._id}`);
    }
    
    return { prompt, isNew: true };
  } catch (error) {
    console.error(`❌ Error saving prompt ${entry.id}:`, error);
    return { prompt: null, isNew: false, reason: error instanceof Error ? error.message : "Unknown error" };
  }
}

/**
 * Save multiple prompts to the database
 * Returns stats about the operation
 */
export async function savePrompts(
  entries: PromptEntry[],
  options: { verbose?: boolean } = {}
): Promise<{
  total: number;
  created: number;
  updated: number;
  skipped: number;
  failed: number;
  prompts: IPrompt[];
  errors: Array<{ id: string; reason: string }>;
}> {
  const results = {
    total: entries.length,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    prompts: [] as IPrompt[],
    errors: [] as Array<{ id: string; reason: string }>,
  };

  if (options.verbose) {
    console.log(`\n🔄 Processing ${entries.length} prompts...`);
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    
    if (options.verbose && i > 0 && i % 10 === 0) {
      console.log(`\n📊 Progress: ${i}/${entries.length} processed...`);
    }
    
    try {
      const result = await savePrompt(entry, { verbose: options.verbose });
      
      if (result.prompt) {
        results.prompts.push(result.prompt);
        if (result.isNew) {
          results.created++;
        } else {
          results.updated++;
        }
      } else {
        if (result.reason) {
          results.skipped++;
          results.errors.push({ id: entry.id, reason: result.reason });
        } else {
          results.failed++;
          results.errors.push({ id: entry.id, reason: "Unknown error" });
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      console.error(`❌ Error processing prompt ${entry.id}:`, error);
      results.failed++;
      results.errors.push({ id: entry.id, reason: errorMsg });
    }
  }

  if (options.verbose) {
    console.log(`\n✅ Processing complete!`);
  }

  return results;
}

/**
 * Get prompts by source
 */
export async function getPromptsBySource(
  source: string,
  limit: number = 50
): Promise<IPrompt[]> {
  return await Prompt.find({ platforms: source })
    .sort({ trendScore: -1, firstSeenAt: -1 })
    .limit(limit);
}

/**
 * Get prompts by AI tool
 */
export async function getPromptsByAITool(
  aiTool: string,
  limit: number = 50
): Promise<IPrompt[]> {
  return await Prompt.find({ aiTools: aiTool })
    .sort({ trendScore: -1, firstSeenAt: -1 })
    .limit(limit);
}

/**
 * Get trending prompts
 */
export async function getTrendingPrompts(limit: number = 50): Promise<IPrompt[]> {
  return await Prompt.find({ isApproved: true })
    .sort({ trendScore: -1, firstSeenAt: -1 })
    .limit(limit);
}

export default {
  savePrompt,
  savePrompts,
  getPromptsBySource,
  getPromptsByAITool,
  getTrendingPrompts,
};
