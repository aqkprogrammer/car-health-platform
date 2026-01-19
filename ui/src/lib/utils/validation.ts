/**
 * File validation utilities
 */

import {
  MAX_PHOTO_SIZE,
  MAX_VIDEO_SIZE,
  MIN_VIDEO_DURATION,
  MAX_VIDEO_DURATION,
  ALLOWED_PHOTO_TYPES,
  ALLOWED_VIDEO_TYPES,
} from '@/types/car';

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileValidationOptions {
  file: File;
  isVideo?: boolean;
  checkDuration?: boolean;
  duration?: number;
}

/**
 * Validate file type
 */
export function validateFileType(file: File, isVideo: boolean = false): ValidationResult {
  const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_PHOTO_TYPES;
  const typeLabel = isVideo ? 'video' : 'photo';
  const expectedTypes = isVideo ? 'MP4' : 'JPG or PNG';

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Only ${expectedTypes} ${typeLabel}s are allowed.`,
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(file: File, isVideo: boolean = false): ValidationResult {
  const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_PHOTO_SIZE;
  const maxSizeMB = maxSize / (1024 * 1024);
  const typeLabel = isVideo ? 'video' : 'photo';

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `${typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1)} size exceeds maximum allowed size of ${maxSizeMB}MB`,
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
}

/**
 * Validate video duration
 */
export function validateVideoDuration(duration: number): ValidationResult {
  if (duration < MIN_VIDEO_DURATION) {
    return {
      valid: false,
      error: `Video must be at least ${MIN_VIDEO_DURATION} seconds long`,
    };
  }

  if (duration > MAX_VIDEO_DURATION) {
    return {
      valid: false,
      error: `Video must be no longer than ${MAX_VIDEO_DURATION} seconds`,
    };
  }

  return { valid: true };
}

/**
 * Comprehensive file validation
 */
export function validateFile(options: FileValidationOptions): ValidationResult {
  const { file, isVideo = false, checkDuration = false, duration } = options;

  // Validate file type
  const typeValidation = validateFileType(file, isVideo);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Validate file size
  const sizeValidation = validateFileSize(file, isVideo);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  // Validate video duration if needed
  if (isVideo && checkDuration && duration !== undefined) {
    const durationValidation = validateVideoDuration(duration);
    if (!durationValidation.valid) {
      return durationValidation;
    }
  }

  return { valid: true };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2).toLowerCase();
}

/**
 * Check if file extension matches MIME type
 */
export function validateFileExtension(file: File): ValidationResult {
  const extension = getFileExtension(file.name);
  const mimeType = file.type;

  // Map extensions to MIME types
  const extensionMap: Record<string, string[]> = {
    jpg: ['image/jpeg', 'image/jpg'],
    jpeg: ['image/jpeg', 'image/jpg'],
    png: ['image/png'],
    mp4: ['video/mp4'],
  };

  const expectedMimeTypes = extensionMap[extension];
  if (!expectedMimeTypes) {
    return {
      valid: false,
      error: `Unsupported file extension: .${extension}`,
    };
  }

  if (!expectedMimeTypes.includes(mimeType)) {
    return {
      valid: false,
      error: `File extension (.${extension}) does not match file type (${mimeType})`,
    };
  }

  return { valid: true };
}
