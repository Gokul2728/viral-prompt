/**
 * Prompt Builder Service
 * Generates creative prompts from visual features and signals
 */

import { IClusterVisualFeatures } from '../models/Cluster';

// Templates for different styles
const STYLE_TEMPLATES: Record<string, string[]> = {
  cinematic: [
    'A cinematic shot of {subject} in {environment}, {emotion} lighting, film grain, anamorphic lens flare',
    '{subject} in {environment}, cinematic composition, dramatic {emotion} atmosphere, 35mm film look',
    'Epic cinematic scene featuring {subject}, {environment} backdrop, {motion}, movie poster quality',
  ],
  anime: [
    'Anime illustration of {subject} in {environment}, {emotion} expression, {style} style, trending on ArtStation',
    '{subject} anime art, {environment} background, {emotion} mood, studio Ghibli inspired',
    'Japanese anime style {subject}, detailed {environment}, beautiful {emotion} scene, trending',
  ],
  realistic: [
    'Hyperrealistic {subject} in {environment}, {emotion} atmosphere, 8K resolution, professional photography',
    'Photorealistic depiction of {subject}, {environment} setting, natural {emotion} lighting, DSLR quality',
    'Ultra realistic {subject} portrait in {environment}, {motion}, studio quality, sharp focus',
  ],
  fantasy: [
    'Epic fantasy scene of {subject} in {environment}, {emotion} magical atmosphere, concept art',
    '{subject} in enchanted {environment}, {emotion} mystical lighting, fantasy art style',
    'Mythical {subject} surrounded by {environment}, {emotion} fantasy world, highly detailed',
  ],
  cyberpunk: [
    'Cyberpunk {subject} in neon-lit {environment}, {emotion} dystopian atmosphere, blade runner style',
    '{subject} in futuristic {environment}, cyberpunk aesthetic, {emotion} neon glow, detailed',
    'Sci-fi cyberpunk scene with {subject}, {environment} cityscape, {emotion} tech noir',
  ],
  default: [
    'A {style} scene of {subject} in {environment}, {emotion} atmosphere, {motion}, trending AI style',
    '{subject} captured in {environment}, {style} aesthetic, {emotion} mood, high detail',
    'Beautiful {style} artwork of {subject}, {environment} setting, {emotion} tone, professional quality',
  ],
};

// Enhancement phrases
const ENHANCEMENTS = {
  quality: [
    'highly detailed', 'intricate details', 'sharp focus', '8K resolution',
    'professional quality', 'masterpiece', 'best quality', 'trending on ArtStation',
  ],
  lighting: [
    'volumetric lighting', 'ray tracing', 'global illumination', 'dramatic lighting',
    'soft ambient light', 'golden hour', 'rim lighting', 'studio lighting',
  ],
  aspectRatio: {
    image: '1:1, square format',
    video: '9:16, vertical format, short-form content',
  },
};

export interface GeneratedPrompt {
  text: string;
  keywords: string[];
  style: string;
  aspectRatio: string;
  enhancedVersion: string;
}

/**
 * Pick random item from array
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generate a prompt from visual features
 */
export function generatePrompt(
  visualFeatures: IClusterVisualFeatures,
  mediaType: 'image' | 'video' = 'image'
): GeneratedPrompt {
  // Get the dominant style
  const style = visualFeatures.style[0] || 'default';
  const templates = STYLE_TEMPLATES[style] || STYLE_TEMPLATES.default;
  const template = pickRandom(templates);

  // Get values or defaults
  const subject = visualFeatures.subjects[0] || 'a subject';
  const environment = visualFeatures.environment[0] || 'a detailed environment';
  const emotion = visualFeatures.emotion[0] || 'atmospheric';
  const motion = visualFeatures.motion[0] || 'smooth motion';

  // Replace placeholders
  let promptText = template
    .replace(/{subject}/g, subject)
    .replace(/{environment}/g, environment)
    .replace(/{emotion}/g, emotion)
    .replace(/{motion}/g, motion)
    .replace(/{style}/g, style);

  // Build keywords list
  const keywords = [
    ...visualFeatures.subjects.slice(0, 3),
    ...visualFeatures.style.slice(0, 2),
    ...visualFeatures.emotion.slice(0, 2),
    ...visualFeatures.environment.slice(0, 2),
  ].filter(Boolean);

  // Get aspect ratio
  const aspectRatio = ENHANCEMENTS.aspectRatio[mediaType];

  // Build enhanced version
  const quality = pickRandom(ENHANCEMENTS.quality);
  const lighting = pickRandom(ENHANCEMENTS.lighting);
  
  const enhancedVersion = `${promptText}, ${quality}, ${lighting}, ${aspectRatio}`;

  return {
    text: promptText,
    keywords: [...new Set(keywords)],
    style,
    aspectRatio,
    enhancedVersion,
  };
}

/**
 * Generate multiple prompt variations from features
 */
export function generatePromptVariations(
  visualFeatures: IClusterVisualFeatures,
  mediaType: 'image' | 'video' = 'image',
  count: number = 3
): GeneratedPrompt[] {
  const prompts: GeneratedPrompt[] = [];
  const usedTemplates = new Set<string>();

  for (let i = 0; i < count; i++) {
    const prompt = generatePrompt(visualFeatures, mediaType);
    
    // Avoid duplicates
    if (!usedTemplates.has(prompt.text)) {
      usedTemplates.add(prompt.text);
      prompts.push(prompt);
    }
  }

  return prompts;
}

/**
 * Generate a cluster name from visual features
 */
export function generateClusterName(visualFeatures: IClusterVisualFeatures): string {
  const parts: string[] = [];

  // Add key subject
  if (visualFeatures.subjects[0]) {
    parts.push(visualFeatures.subjects[0]);
  }

  // Add emotion modifier
  if (visualFeatures.emotion[0]) {
    parts.push(visualFeatures.emotion[0]);
  }

  // Add style
  if (visualFeatures.style[0]) {
    parts.push(visualFeatures.style[0]);
  }

  // Add environment hint
  if (visualFeatures.environment[0] && parts.length < 4) {
    parts.push(`in ${visualFeatures.environment[0]}`);
  }

  // Capitalize and join
  const name = parts
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' + ');

  return name || 'Trending Visual';
}

/**
 * Build a simple prompt from raw features (fallback)
 */
export function buildSimplePrompt(features: {
  subjects?: string[];
  style?: string[];
  emotion?: string[];
  motion?: string[];
  environment?: string[];
}): string {
  const style = features.style?.[0] || 'cinematic';
  const subject = features.subjects?.[0] || 'a subject';
  const environment = features.environment?.[0] || 'a setting';
  const emotions = features.emotion?.join(', ') || 'neutral';
  const motions = features.motion?.join(', ') || 'smooth';

  return `
A ${style} scene of ${subject} in ${environment},
emotional tone: ${emotions},
motion: ${motions},
high detail, trending AI style,
vertical 9:16
`.trim();
}

/**
 * Generate negative prompt based on style
 */
export function generateNegativePrompt(style: string): string {
  const commonNegatives = [
    'blurry', 'low quality', 'watermark', 'text', 'logo',
    'bad anatomy', 'deformed', 'disfigured', 'ugly',
    'duplicate', 'morbid', 'mutilated', 'out of frame',
  ];

  const styleNegatives: Record<string, string[]> = {
    realistic: ['cartoon', 'anime', 'illustration', 'drawing', 'painting'],
    anime: ['realistic', 'photorealistic', '3d', 'photograph'],
    cinematic: ['amateur', 'snapshot', 'phone camera', 'low budget'],
  };

  const additionalNegatives = styleNegatives[style] || [];
  
  return [...commonNegatives, ...additionalNegatives].join(', ');
}

/**
 * Enhance prompt with AI tool specific modifiers
 */
export function enhanceForAITool(
  prompt: string,
  tool: 'midjourney' | 'stable-diffusion' | 'dalle' | 'runway' | 'pika' | 'generic'
): string {
  const toolEnhancements: Record<string, string> = {
    midjourney: '--ar 9:16 --v 6 --style raw',
    'stable-diffusion': 'SDXL, high resolution, detailed',
    dalle: 'digital art, high quality',
    runway: 'cinematic, smooth camera movement, professional',
    pika: 'high quality animation, smooth motion',
    generic: 'trending, high quality, professional',
  };

  return `${prompt}, ${toolEnhancements[tool] || toolEnhancements.generic}`;
}

export default {
  generatePrompt,
  generatePromptVariations,
  generateClusterName,
  buildSimplePrompt,
  generateNegativePrompt,
  enhanceForAITool,
};
