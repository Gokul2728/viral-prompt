/**
 * Signal Extraction Service
 * Extracts prompt signals from text content (titles, captions, descriptions)
 */

// Keyword mappings for different signal types
const KEYWORDS: Record<string, string[]> = {
  style: [
    'cinematic', 'anime', 'realistic', 'photorealistic', 'cyberpunk', 'vintage',
    'noir', 'minimalist', 'surreal', 'abstract', 'fantasy', 'sci-fi', 'gothic',
    'retro', 'futuristic', 'dreamlike', 'ethereal', 'dramatic', 'moody',
    '3d render', 'digital art', 'oil painting', 'watercolor', 'sketch',
    'illustration', 'concept art', 'pixel art', 'vaporwave', 'synthwave',
    'steampunk', 'art nouveau', 'baroque', 'impressionist', 'pop art',
    'glitch art', 'neon', 'pastel', 'monochrome', 'high contrast',
    'low poly', 'isometric', 'flat design', 'brutalist', 'kawaii'
  ],
  emotion: [
    'sad', 'happy', 'nostalgic', 'dark', 'melancholic', 'joyful', 'peaceful',
    'anxious', 'hopeful', 'lonely', 'romantic', 'mysterious', 'eerie',
    'calm', 'energetic', 'intense', 'serene', 'dramatic', 'whimsical',
    'haunting', 'uplifting', 'bittersweet', 'triumphant', 'contemplative'
  ],
  motion: [
    'slow motion', 'slow mo', 'time lapse', 'timelapse', 'zoom in', 'zoom out',
    'pan', 'tracking shot', 'dolly', 'crane shot', 'handheld', 'smooth',
    'fast motion', 'reverse', 'parallax', 'orbit', 'fly through',
    'push in', 'pull out', 'static', 'floating', 'gliding', 'morphing',
    'transition', 'loop', 'seamless loop'
  ],
  quality: [
    '8k', '4k', 'ultra hd', 'high resolution', 'hdr', 'ultra realistic',
    'hyperrealistic', 'highly detailed', 'intricate detail', 'sharp focus',
    'professional', 'studio quality', 'masterpiece', 'best quality',
    'award winning', 'trending', 'viral', 'perfect lighting', 'ray tracing'
  ],
  subjects: [
    'boy', 'girl', 'man', 'woman', 'child', 'robot', 'android', 'cyborg',
    'alien', 'monster', 'creature', 'animal', 'cat', 'dog', 'bird',
    'dragon', 'phoenix', 'unicorn', 'fairy', 'angel', 'demon',
    'warrior', 'wizard', 'witch', 'knight', 'samurai', 'ninja',
    'astronaut', 'explorer', 'scientist', 'artist', 'musician',
    'car', 'spaceship', 'castle', 'temple', 'tower', 'city skyline'
  ],
  environment: [
    'rain', 'snow', 'forest', 'city', 'urban', 'nature', 'ocean', 'beach',
    'mountain', 'desert', 'space', 'interior', 'outdoor', 'night', 'day',
    'sunset', 'sunrise', 'storm', 'cloud', 'sky', 'street', 'building',
    'underwater', 'cave', 'jungle', 'arctic', 'volcano', 'ruins',
    'garden', 'library', 'laboratory', 'throne room', 'battlefield',
    'cyberpunk city', 'neon lights', 'abandoned', 'post apocalyptic'
  ]
};

// AI tool mentions
const AI_TOOLS = [
  'midjourney', 'stable diffusion', 'dall-e', 'dalle', 'runway',
  'pika', 'luma', 'sora', 'veo', 'gemini', 'firefly', 'leonardo',
  'krea', 'ideogram', 'flux', 'kling', 'haiper', 'gen-2', 'gen-3'
];

export interface TextSignals {
  style: string[];
  emotion: string[];
  motion: string[];
  quality: string[];
  subjects: string[];
  environment: string[];
  aiTools: string[];
  hashtags: string[];
}

/**
 * Extract signals from text content
 */
export function extractSignals(text: string): TextSignals {
  const lower = text.toLowerCase();
  const signals: TextSignals = {
    style: [],
    emotion: [],
    motion: [],
    quality: [],
    subjects: [],
    environment: [],
    aiTools: [],
    hashtags: [],
  };

  // Extract each signal type
  for (const [type, words] of Object.entries(KEYWORDS)) {
    const found = words.filter(word => {
      // Handle multi-word phrases
      if (word.includes(' ')) {
        return lower.includes(word);
      }
      // Handle single words with word boundary check
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(lower);
    });
    (signals as unknown as Record<string, string[]>)[type] = [...new Set(found)];
  }

  // Extract AI tool mentions
  signals.aiTools = AI_TOOLS.filter(tool => {
    const regex = new RegExp(`\\b${tool.replace(/-/g, '[- ]?')}\\b`, 'i');
    return regex.test(lower);
  });

  // Extract hashtags
  const hashtagRegex = /#(\w+)/g;
  const hashtags: string[] = [];
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    hashtags.push(match[1].toLowerCase());
  }
  signals.hashtags = [...new Set(hashtags)];

  return signals;
}

/**
 * Extract signals from multiple text fields
 */
export function extractSignalsFromMultiple(
  title?: string,
  description?: string,
  caption?: string,
  comments?: string[]
): TextSignals {
  const allText = [
    title || '',
    description || '',
    caption || '',
    ...(comments || [])
  ].join(' ');

  return extractSignals(allText);
}

/**
 * Calculate signal strength (how many signals were found)
 */
export function calculateSignalStrength(signals: TextSignals): number {
  const totalSignals = 
    signals.style.length * 2 +
    signals.emotion.length * 1.5 +
    signals.motion.length * 1 +
    signals.quality.length * 0.5 +
    signals.subjects.length * 2 +
    signals.environment.length * 1.5 +
    signals.aiTools.length * 3;

  // Normalize to 0-100
  return Math.min(100, totalSignals * 5);
}

/**
 * Merge visual features with text signals
 */
export function mergeSignals(
  visualFeatures: {
    subjects: string[];
    emotion: string[];
    style: string[];
    motion: string[];
    environment: string[];
  },
  textSignals: TextSignals
): {
  subjects: string[];
  emotion: string[];
  style: string[];
  motion: string[];
  environment: string[];
} {
  return {
    subjects: [...new Set([...visualFeatures.subjects, ...textSignals.subjects])],
    emotion: [...new Set([...visualFeatures.emotion, ...textSignals.emotion])],
    style: [...new Set([...visualFeatures.style, ...textSignals.style])],
    motion: [...new Set([...visualFeatures.motion, ...textSignals.motion])],
    environment: [...new Set([...visualFeatures.environment, ...textSignals.environment])],
  };
}

export default {
  extractSignals,
  extractSignalsFromMultiple,
  calculateSignalStrength,
  mergeSignals,
};
