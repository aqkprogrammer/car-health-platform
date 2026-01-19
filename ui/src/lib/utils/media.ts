/**
 * Media utility functions for handling image and video processing
 */

/**
 * Get image dimensions from a file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

/**
 * Get video duration and dimensions from a file
 */
export function getVideoMetadata(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };
    
    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Failed to load video'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

/**
 * Validate video duration (should be between 10-20 seconds)
 */
export function validateVideoDuration(duration: number): { valid: boolean; error?: string } {
  if (duration < 10) {
    return { valid: false, error: 'Video must be at least 10 seconds long' };
  }
  if (duration > 20) {
    return { valid: false, error: 'Video must be no longer than 20 seconds' };
  }
  return { valid: true };
}

/**
 * Extract storage key from presigned URL
 * This is a helper to extract the key from URLs like:
 * https://bucket.s3.amazonaws.com/path/to/file.jpg?presigned=true&expires=...
 */
export function extractStorageKeyFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove query parameters and get the pathname
    return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname;
  } catch {
    // Fallback: try to extract from URL string
    const match = url.match(/https?:\/\/[^\/]+\/(.+?)(?:\?|$)/);
    return match ? match[1] : url.split('?')[0];
  }
}

/**
 * Default placeholder image for cars
 * Using a generic car image from Unsplash as fallback
 */
export const DEFAULT_CAR_IMAGE = "https://images.unsplash.com/photo-1492144534655-ae79c2c034d7?w=800&h=600&fit=crop&auto=format&q=80";

/**
 * Default placeholder image for general use
 */
export const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1492144534655-ae79c2c034d7?w=800&h=600&fit=crop&auto=format&q=80";

/**
 * Handle image error by replacing with default image
 */
export function handleImageError(e: React.SyntheticEvent<HTMLImageElement, Event>, fallback?: string) {
  const target = e.currentTarget;
  if (target.src !== (fallback || DEFAULT_IMAGE)) {
    target.src = fallback || DEFAULT_IMAGE;
  }
}
