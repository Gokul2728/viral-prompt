# Prompt Service - Duplicate Detection & Validation

## Overview

The Prompt Service includes robust validation and duplicate detection to ensure data quality when saving prompts from multiple sources.

## Validation Features

### 1. **Multi-Method Duplicate Detection**

The service checks for existing prompts using three methods:

- **Text Match**: Case-insensitive comparison of prompt text (normalized)
- **Scraper ID**: Checks metadata for matching scraper IDs
- **Image URL**: Detects same images with potentially different text

### 2. **Data Validation**

Before saving, the service validates:
- ✅ Prompt text is not empty
- ✅ Image URL is present
- ✅ Required fields are properly formatted

### 3. **Smart Updates**

When a duplicate is found, the service:
- Updates engagement metrics (likes, trend score) if higher
- Adds new platforms/sources (cross-platform tracking)
- Merges AI tools and tags
- Preserves existing user-generated engagement (fires, wows, copies)
- Tracks last scraped source and timestamp

## Usage

### Basic Usage

```typescript
import { savePrompts } from "../services/promptService";

// Save with minimal output
const results = await savePrompts(prompts);
console.log(`Created: ${results.created}, Updated: ${results.updated}`);
```

### Verbose Mode

```typescript
// Enable verbose logging to see validation in action
const results = await savePrompts(prompts, { verbose: true });

// Output shows:
// ♻️  Updating existing prompt: 507f1f77bcf86cd799439011
//   ➕ Added platform: civitai
//   ➕ Added AI tool: midjourney
//   ➕ Added 3 new tags
//   ✅ Updated successfully
```

### Single Prompt

```typescript
import { savePrompt } from "../services/promptService";

const result = await savePrompt(promptEntry, { verbose: true });

if (result.prompt) {
  console.log(`Prompt ${result.isNew ? "created" : "updated"}`);
} else {
  console.log(`Failed: ${result.reason}`);
}
```

## Return Values

### `savePrompts()` returns:

```typescript
{
  total: number;        // Total prompts processed
  created: number;      // New prompts created
  updated: number;      // Existing prompts updated
  skipped: number;      // Prompts skipped (validation failed)
  failed: number;       // Prompts that errored
  prompts: IPrompt[];   // Array of saved prompts
  errors: Array<{       // Details of failures
    id: string;
    reason: string;
  }>;
}
```

### `savePrompt()` returns:

```typescript
{
  prompt: IPrompt | null;  // Saved prompt or null if failed
  isNew: boolean;          // True if created, false if updated
  reason?: string;         // Failure reason if prompt is null
}
```

## Testing

### Test Prompt Fetching & Saving

```bash
npm run test:prompts
```

This script:
1. Fetches prompts from all sources
2. Saves them to the database
3. Shows statistics and sample results

### Test Duplicate Detection

```bash
npm run test:validation
```

This script:
1. Fetches and saves prompts (Round 1)
2. Fetches the same sources again (Round 2)
3. Demonstrates duplicate detection
4. Shows cross-platform tracking
5. Calculates detection effectiveness

Expected output on Round 2:
- Most prompts should be **updated**, not created
- Shows "♻️ Updating existing prompt" messages
- Cross-platform count increases for duplicates

## Cross-Platform Tracking

When the same prompt appears on multiple platforms:

```typescript
{
  text: "a beautiful sunset over mountains...",
  platforms: ["civitai", "prompthero", "lexica"],
  crossPlatformCount: 3,
  likes: 156,  // Highest likes across all platforms
  trendScore: 87.3,  // Best trend score
  metadata: {
    lastScrapedFrom: "lexica",
    lastScrapedAt: "2026-02-12T10:30:00.000Z"
  }
}
```

## Error Handling

The service gracefully handles:
- Empty or malformed prompts (skipped)
- Missing required fields (skipped with reason)
- Database errors (logged and counted as failed)
- Regex escaping for special characters in text

All errors are:
- ✅ Logged with context
- ✅ Tracked in results
- ✅ Non-blocking (processing continues)

## Best Practices

1. **Use verbose mode during development** to understand validation behavior
2. **Check the errors array** in results for skipped/failed prompts
3. **Monitor cross-platform count** to identify truly viral prompts
4. **Run test:validation periodically** to ensure detection is working
5. **Review skipped prompts** to identify data quality issues at source

## Future Enhancements

Potential improvements:
- Fuzzy text matching for similar prompts
- Image similarity detection using Vision API
- Batch processing with configurable concurrency
- Webhook notifications for high-value duplicates
- Automatic approval for cross-platform prompts
