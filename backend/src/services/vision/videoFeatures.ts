/**
 * Video Feature Extraction Service
 * Combines frame extraction with image analysis
 */

import { IVisualFeatures } from '../../models/Post';
import { extractFrames, extractFramesFromFile, detectMotionType, cleanupFrames } from './videoFrames';
import { extractImageFeaturesFromFile } from './imageFeatures';

/**
 * Extract visual features from a video URL
 */
export async function extractVideoFeatures(videoUrl: string): Promise<IVisualFeatures> {
  let frames: string[] = [];
  
  try {
    // Extract frames from video
    frames = await extractFrames(videoUrl, 5);
    
    if (frames.length === 0) {
      throw new Error('No frames extracted from video');
    }

    // Aggregate features from all frames
    const aggregated = {
      subjects: new Set<string>(),
      style: new Set<string>(),
      emotion: new Set<string>(),
      environment: new Set<string>(),
    };

    // Process each frame
    for (const frame of frames) {
      try {
        const features = await extractImageFeaturesFromFile(frame);
        
        features.subjects.forEach(v => aggregated.subjects.add(v));
        features.style.forEach(v => aggregated.style.add(v));
        features.emotion.forEach(v => aggregated.emotion.add(v));
        features.environment.forEach(v => aggregated.environment.add(v));
      } catch (error) {
        console.error('Error processing frame:', error);
      }
    }

    // Detect motion type from video
    let motionTypes: string[];
    try {
      motionTypes = await detectMotionType(videoUrl);
    } catch (error) {
      motionTypes = ['smooth']; // Default
    }

    return {
      subjects: [...aggregated.subjects].slice(0, 15),
      style: [...aggregated.style].slice(0, 10),
      emotion: [...aggregated.emotion].slice(0, 5),
      environment: [...aggregated.environment].slice(0, 10),
      motion: motionTypes,
    };
  } catch (error) {
    console.error('Error extracting video features:', error);
    return {
      subjects: [],
      emotion: [],
      style: [],
      motion: ['smooth'],
      environment: [],
    };
  } finally {
    // Cleanup frames
    if (frames.length > 0) {
      cleanupFrames(frames);
    }
  }
}

/**
 * Extract visual features from a local video file
 */
export async function extractVideoFeaturesFromFile(videoPath: string): Promise<IVisualFeatures> {
  let frames: string[] = [];
  
  try {
    frames = await extractFramesFromFile(videoPath, 5);
    
    if (frames.length === 0) {
      throw new Error('No frames extracted from video');
    }

    const aggregated = {
      subjects: new Set<string>(),
      style: new Set<string>(),
      emotion: new Set<string>(),
      environment: new Set<string>(),
    };

    for (const frame of frames) {
      try {
        const features = await extractImageFeaturesFromFile(frame);
        
        features.subjects.forEach(v => aggregated.subjects.add(v));
        features.style.forEach(v => aggregated.style.add(v));
        features.emotion.forEach(v => aggregated.emotion.add(v));
        features.environment.forEach(v => aggregated.environment.add(v));
      } catch (error) {
        console.error('Error processing frame:', error);
      }
    }

    let motionTypes: string[];
    try {
      motionTypes = await detectMotionType(videoPath);
    } catch (error) {
      motionTypes = ['smooth'];
    }

    return {
      subjects: [...aggregated.subjects].slice(0, 15),
      style: [...aggregated.style].slice(0, 10),
      emotion: [...aggregated.emotion].slice(0, 5),
      environment: [...aggregated.environment].slice(0, 10),
      motion: motionTypes,
    };
  } catch (error) {
    console.error('Error extracting video features from file:', error);
    return {
      subjects: [],
      emotion: [],
      style: [],
      motion: ['smooth'],
      environment: [],
    };
  } finally {
    if (frames.length > 0) {
      cleanupFrames(frames);
    }
  }
}

export default {
  extractVideoFeatures,
  extractVideoFeaturesFromFile,
};
