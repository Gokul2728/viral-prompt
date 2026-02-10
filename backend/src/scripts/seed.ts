/**
 * Seed Script - Populate database with sample data
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { Prompt, ViralChat, User } from "../models";

dotenv.config();

const PLATFORMS = [
  "reddit",
  "twitter",
  "youtube",
  "instagram",
  "pinterest",
  "tiktok",
];
const AI_TOOLS = [
  "midjourney",
  "dalle",
  "stable-diffusion",
  "runway",
  "leonardo",
  "firefly",
];
const CATEGORIES = [
  "funny",
  "creative",
  "professional",
  "art",
  "writing",
  "coding",
];

const SAMPLE_PROMPTS = [
  {
    text: "Cyberpunk city at night with neon lights reflecting on wet streets, highly detailed, cinematic lighting",
    type: "image",
    tags: ["cyberpunk", "city", "neon", "night"],
    viralScore: 95,
    trending: true,
  },
  {
    text: "Beautiful anime girl with cherry blossoms, soft pastel colors, Studio Ghibli style",
    type: "image",
    tags: ["anime", "cherry blossoms", "ghibli"],
    viralScore: 92,
    trending: true,
  },
  {
    text: "Ethereal forest with magical creatures, bioluminescent plants, dreamlike atmosphere",
    type: "image",
    tags: ["fantasy", "forest", "magical"],
    viralScore: 88,
    trending: true,
  },
  {
    text: "Futuristic robot portrait, chrome and gold details, dramatic lighting, 8K ultra HD",
    type: "image",
    tags: ["robot", "futuristic", "portrait"],
    viralScore: 85,
  },
  {
    text: "Ancient temple hidden in jungle, rays of light through leaves, photorealistic",
    type: "image",
    tags: ["temple", "jungle", "ancient"],
    viralScore: 82,
  },
  {
    text: "Cinematic drone shot of mountains at golden hour, epic landscape, 4K video",
    type: "video",
    tags: ["landscape", "mountains", "drone"],
    viralScore: 90,
    trending: true,
  },
  {
    text: "Smooth camera transition through futuristic city, seamless motion, sci-fi atmosphere",
    type: "video",
    tags: ["video", "transition", "city"],
    viralScore: 87,
  },
  {
    text: "Steampunk airship flying through clouds, brass and copper details, Victorian era",
    type: "image",
    tags: ["steampunk", "airship", "victorian"],
    viralScore: 79,
  },
  {
    text: "Underwater palace with mermaids, crystal clear water, volumetric god rays",
    type: "image",
    tags: ["underwater", "fantasy", "palace"],
    viralScore: 84,
  },
  {
    text: "Cozy cabin interior with fireplace, snowing outside, warm lighting, hygge aesthetic",
    type: "image",
    tags: ["cozy", "cabin", "winter"],
    viralScore: 81,
  },
];

const SAMPLE_VIRAL_CHATS = [
  {
    title: "The Confused Time Traveler",
    promptText:
      "You are a confused time traveler from 2150 who keeps mixing up historical events. Respond to questions about history but always get the details hilariously wrong.",
    category: "funny",
    isTrending: true,
  },
  {
    title: "Overly Dramatic Narrator",
    promptText:
      "Narrate everything the user does in the most overly dramatic way possible, as if every mundane action is an epic adventure.",
    category: "funny",
    isTrending: true,
  },
  {
    title: "Master Worldbuilder",
    promptText:
      "Help me create a detailed fantasy world. Ask questions about geography, cultures, magic systems, and history to build a consistent universe.",
    category: "creative",
  },
  {
    title: "Code Review Sensei",
    promptText:
      "Review my code like a wise sensei, offering guidance through ancient programming wisdom and occasional haikus about clean code.",
    category: "coding",
    isTrending: true,
  },
  {
    title: "Shakespearean Tech Support",
    promptText:
      "Provide technical support and troubleshooting but speak only in Shakespearean English with dramatic monologues about computer problems.",
    category: "funny",
  },
  {
    title: "Art Style Fusion Expert",
    promptText:
      "I can help you combine different art styles to create unique prompts. Describe two styles you want to merge and I'll craft the perfect prompt.",
    category: "art",
  },
];

async function seed() {
  try {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/viral_prompt";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await Promise.all([Prompt.deleteMany({}), ViralChat.deleteMany({})]);
    console.log("🗑️ Cleared existing data");

    // Create prompts
    const prompts = SAMPLE_PROMPTS.map((p) => ({
      ...p,
      platform: PLATFORMS[Math.floor(Math.random() * PLATFORMS.length)],
      aiTool: AI_TOOLS[Math.floor(Math.random() * AI_TOOLS.length)],
      previewUrl: `https://picsum.photos/500/500?random=${Math.random()}`,
      likes: Math.floor(Math.random() * 10000) + 1000,
      shares: Math.floor(Math.random() * 2000) + 100,
      saves: Math.floor(Math.random() * 1000) + 50,
      comments: Math.floor(Math.random() * 500) + 20,
      dateDiscovered: new Date(
        Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      ),
    }));

    await Prompt.insertMany(prompts);
    console.log(`📝 Created ${prompts.length} prompts`);

    // Create viral chats
    const viralChats = SAMPLE_VIRAL_CHATS.map((c) => ({
      ...c,
      previewUrl: `https://picsum.photos/400/300?random=${Math.random()}`,
      views: Math.floor(Math.random() * 50000) + 5000,
      copies: Math.floor(Math.random() * 10000) + 500,
      likes: Math.floor(Math.random() * 5000) + 200,
    }));

    await ViralChat.insertMany(viralChats);
    console.log(`💬 Created ${viralChats.length} viral chats`);

    // Create admin user if not exists
    const adminEmail = "admin@viralprompt.app";
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      admin = new User({
        email: adminEmail,
        displayName: "Admin User",
        isAdmin: true,
        isGuest: false,
      });
      await admin.save();
      console.log("👤 Created admin user");
    }

    console.log("\n✨ Seed completed successfully!\n");

    // Summary
    const [promptCount, chatCount, userCount] = await Promise.all([
      Prompt.countDocuments(),
      ViralChat.countDocuments(),
      User.countDocuments(),
    ]);

    console.log("📊 Database Summary:");
    console.log(`   - Prompts: ${promptCount}`);
    console.log(`   - Viral Chats: ${chatCount}`);
    console.log(`   - Users: ${userCount}`);

    await mongoose.disconnect();
    console.log("\n👋 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
