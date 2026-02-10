/**
 * Image Feature Extraction Service
 * Uses Google Cloud Vision API for image analysis
 */

import vision from '@google-cloud/vision';
import { IVisualFeatures } from '../../models/Post';

// Initialize Vision client
const client = new vision.ImageAnnotatorClient();

// Style keywords mapping
const STYLE_KEYWORDS = [
  'cinematic', 'anime', 'realistic', 'cyberpunk', 'vintage', 'noir',
  'minimalist', 'surreal', 'abstract', 'fantasy', 'sci-fi', 'gothic',
  'retro', 'futuristic', 'dreamlike', 'ethereal', 'dramatic', 'artistic',
  'photorealistic', '3d render', 'digital art', 'oil painting', 'watercolor'
];

// Emotion mapping from face detection
const EMOTION_MAP: Record<string, string> = {
  'joy': 'happy',
  'sorrow': 'sad',
  'anger': 'angry',
  'surprise': 'surprised',
  'blurred': 'mysterious',
  'headwear': 'character',
};

// Environment keywords
const ENVIRONMENT_KEYWORDS = [
  'rain', 'snow', 'forest', 'city', 'urban', 'nature', 'ocean', 'beach',
  'mountain', 'desert', 'space', 'interior', 'outdoor', 'night', 'day',
  'sunset', 'sunrise', 'storm', 'cloud', 'sky', 'street', 'building'
];

/**
 * Extract visual features from an image URL
 */
export async function extractImageFeatures(imageUrl: string): Promise<IVisualFeatures> {
  try {
    const [result] = await client.annotateImage({
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 30 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
        { type: 'FACE_DETECTION', maxResults: 5 },
        { type: 'IMAGE_PROPERTIES' },
      ],
    });

    // Extract labels
    const labels = result.labelAnnotations?.map(l => l.description?.toLowerCase() || '') || [];
    
    // Extract objects
    const objects = result.localizedObjectAnnotations?.map(o => o.name?.toLowerCase() || '') || [];
    
    // Extract emotions from face detection
    const emotions: string[] = [];
    if (result.faceAnnotations) {
      for (const face of result.faceAnnotations) {
        if (face.joyLikelihood === 'VERY_LIKELY' || face.joyLikelihood === 'LIKELY') {
          emotions.push('happy');
        }
        if (face.sorrowLikelihood === 'VERY_LIKELY' || face.sorrowLikelihood === 'LIKELY') {
          emotions.push('sad');
        }
        if (face.angerLikelihood === 'VERY_LIKELY' || face.angerLikelihood === 'LIKELY') {
          emotions.push('angry');
        }
        if (face.surpriseLikelihood === 'VERY_LIKELY' || face.surpriseLikelihood === 'LIKELY') {
          emotions.push('surprised');
        }
      }
    }

    // Categorize labels into style and environment
    const style: string[] = [];
    const environment: string[] = [];
    const allText = [...labels, ...objects].join(' ');

    for (const keyword of STYLE_KEYWORDS) {
      if (allText.includes(keyword)) {
        style.push(keyword);
      }
    }

    for (const keyword of ENVIRONMENT_KEYWORDS) {
      if (allText.includes(keyword)) {
        environment.push(keyword);
      }
    }

    // Subjects are the main objects detected
    const subjects = objects.filter(obj => 
      !ENVIRONMENT_KEYWORDS.some(env => obj.includes(env))
    );

    return {
      subjects: [...new Set(subjects)].slice(0, 10),
      emotion: [...new Set(emotions)].slice(0, 5),
      style: [...new Set(style)].slice(0, 10),
      motion: [], // Motion is detected from video
      environment: [...new Set(environment)].slice(0, 10),
    };
  } catch (error) {
    console.error('Error extracting image features:', error);
    // Return empty features on error
    return {
      subjects: [],
      emotion: [],
      style: [],
      motion: [],
      environment: [],
    };
  }
}

/**
 * Extract features from local image file
 */
export async function extractImageFeaturesFromFile(filePath: string): Promise<IVisualFeatures> {
  try {
    const [result] = await client.annotateImage({
      image: { source: { filename: filePath } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 30 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 20 },
        { type: 'FACE_DETECTION', maxResults: 5 },
        { type: 'IMAGE_PROPERTIES' },
      ],
    });

    // Same processing as above
    const labels = result.labelAnnotations?.map(l => l.description?.toLowerCase() || '') || [];
    const objects = result.localizedObjectAnnotations?.map(o => o.name?.toLowerCase() || '') || [];
    
    const emotions: string[] = [];
    if (result.faceAnnotations) {
      for (const face of result.faceAnnotations) {
        if (face.joyLikelihood === 'VERY_LIKELY' || face.joyLikelihood === 'LIKELY') {
          emotions.push('happy');
        }
        if (face.sorrowLikelihood === 'VERY_LIKELY' || face.sorrowLikelihood === 'LIKELY') {
          emotions.push('sad');
        }
        if (face.angerLikelihood === 'VERY_LIKELY' || face.angerLikelihood === 'LIKELY') {
          emotions.push('angry');
        }
        if (face.surpriseLikelihood === 'VERY_LIKELY' || face.surpriseLikelihood === 'LIKELY') {
          emotions.push('surprised');
        }
      }
    }

    const style: string[] = [];
    const environment: string[] = [];
    const allText = [...labels, ...objects].join(' ');

    for (const keyword of STYLE_KEYWORDS) {
      if (allText.includes(keyword)) {
        style.push(keyword);
      }
    }

    for (const keyword of ENVIRONMENT_KEYWORDS) {
      if (allText.includes(keyword)) {
        environment.push(keyword);
      }
    }

    const subjects = objects.filter(obj => 
      !ENVIRONMENT_KEYWORDS.some(env => obj.includes(env))
    );

    return {
      subjects: [...new Set(subjects)].slice(0, 10),
      emotion: [...new Set(emotions)].slice(0, 5),
      style: [...new Set(style)].slice(0, 10),
      motion: [],
      environment: [...new Set(environment)].slice(0, 10),
    };
  } catch (error) {
    console.error('Error extracting image features from file:', error);
    return {
      subjects: [],
      emotion: [],
      style: [],
      motion: [],
      environment: [],
    };
  }
}

export default {
  extractImageFeatures,
  extractImageFeaturesFromFile,
};
