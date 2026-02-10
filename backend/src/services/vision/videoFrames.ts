/**
 * Video Frame Extraction Service
 * Extracts frames from videos for visual analysis
 */

import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Motion detection keywords
const MOTION_KEYWORDS = [
  'slow motion', 'time lapse', 'zoom in', 'zoom out', 'pan',
  'tracking shot', 'dolly', 'crane shot', 'static', 'handheld',
  'smooth', 'fast motion', 'reverse', 'parallax'
];

/**
 * Extract frames from a video URL
 */
export async function extractFrames(
  videoUrl: string,
  frameCount: number = 5
): Promise<string[]> {
  const framesDir = path.join(os.tmpdir(), `frames_${Date.now()}`);
  
  // Create temp directory
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoUrl)
      .screenshots({
        count: frameCount,
        folder: framesDir,
        filename: 'frame-%i.jpg',
        size: '640x?', // Resize for faster processing
      })
      .on('end', () => {
        try {
          const files = fs.readdirSync(framesDir)
            .filter(f => f.endsWith('.jpg'))
            .sort()
            .map(f => path.join(framesDir, f));
          resolve(files);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      });
  });
}

/**
 * Extract frames from a local video file
 */
export async function extractFramesFromFile(
  videoPath: string,
  frameCount: number = 5
): Promise<string[]> {
  const framesDir = path.join(os.tmpdir(), `frames_${Date.now()}`);
  
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .screenshots({
        count: frameCount,
        folder: framesDir,
        filename: 'frame-%i.jpg',
        size: '640x?',
      })
      .on('end', () => {
        try {
          const files = fs.readdirSync(framesDir)
            .filter(f => f.endsWith('.jpg'))
            .sort()
            .map(f => path.join(framesDir, f));
          resolve(files);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        reject(err);
      });
  });
}

/**
 * Detect motion type from video metadata
 */
export async function detectMotionType(videoUrl: string): Promise<string[]> {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(videoUrl, (err, metadata) => {
      if (err) {
        console.error('FFprobe error:', err);
        resolve(['smooth']); // Default motion type
        return;
      }

      const motionTypes: string[] = [];
      
      // Analyze video stream for hints
      const videoStream = metadata.streams?.find(s => s.codec_type === 'video');
      
      if (videoStream) {
        // Check frame rate for motion hints
        const fps = eval(videoStream.r_frame_rate || '30') as number;
        
        if (fps >= 60) {
          motionTypes.push('slow motion');
        } else if (fps <= 15) {
          motionTypes.push('time lapse');
        } else {
          motionTypes.push('smooth');
        }

        // Check duration
        const duration = metadata.format?.duration || 0;
        if (duration < 3) {
          motionTypes.push('quick cut');
        } else if (duration > 30) {
          motionTypes.push('long take');
        }
      }

      resolve(motionTypes.length > 0 ? motionTypes : ['smooth']);
    });
  });
}

/**
 * Clean up extracted frames
 */
export function cleanupFrames(framePaths: string[]): void {
  for (const framePath of framePaths) {
    try {
      if (fs.existsSync(framePath)) {
        fs.unlinkSync(framePath);
      }
    } catch (error) {
      console.error('Error cleaning up frame:', error);
    }
  }

  // Clean up directory
  if (framePaths.length > 0) {
    const dir = path.dirname(framePaths[0]);
    try {
      if (fs.existsSync(dir)) {
        fs.rmdirSync(dir);
      }
    } catch (error) {
      // Directory might not be empty
    }
  }
}

export default {
  extractFrames,
  extractFramesFromFile,
  detectMotionType,
  cleanupFrames,
};
