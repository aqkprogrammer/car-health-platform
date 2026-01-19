/**
 * Hook for validating required media checklist
 */

import { useState, useCallback, useMemo } from 'react';
import { PhotoType } from '@/types/car';
import { mediaApi } from '@/lib/api';

export interface RequiredMediaChecklist {
  photos: {
    front: boolean;
    rear: boolean;
    left: boolean;
    right: boolean;
    interior: boolean;
    engineBay: boolean;
  };
  video: boolean;
}

export interface MediaValidationResult {
  isValid: boolean;
  missingPhotos: PhotoType[];
  hasVideo: boolean;
  completionPercentage: number;
  canSubmit: boolean;
}

export interface UseMediaValidationReturn {
  validation: MediaValidationResult | null;
  isLoading: boolean;
  error: string | null;
  validateMedia: (carId: string) => Promise<void>;
  checkRequiredMedia: (uploadedMedia: any[]) => MediaValidationResult;
  reset: () => void;
}

const REQUIRED_PHOTO_TYPES: PhotoType[] = [
  'front',
  'rear',
  'left',
  'right',
  'interior',
  'engineBay',
];

export function useMediaValidation(): UseMediaValidationReturn {
  const [validation, setValidation] = useState<MediaValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate media from API
   */
  const validateMedia = useCallback(async (carId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await mediaApi.validateRequiredMedia(carId);

      const uploadedPhotos = REQUIRED_PHOTO_TYPES.filter(
        (type) => !result.missingPhotos.includes(type)
      );

      const completionPercentage = Math.round(
        ((uploadedPhotos.length + (result.hasVideo ? 1 : 0)) / 7) * 100
      );

      const validationResult: MediaValidationResult = {
        isValid: result.isValid,
        missingPhotos: result.missingPhotos,
        hasVideo: result.hasVideo,
        completionPercentage,
        canSubmit: uploadedPhotos.length >= 1, // At least one photo required
      };

      setValidation(validationResult);
    } catch (err: any) {
      setError(err.message || 'Failed to validate media');
      setValidation(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check required media from uploaded media array
   */
  const checkRequiredMedia = useCallback(
    (uploadedMedia: any[]): MediaValidationResult => {
      const photos = uploadedMedia.filter((m) => m.type === 'photo');
      const video = uploadedMedia.find((m) => m.type === 'video');

      const uploadedPhotoTypes = new Set(
        photos.map((p) => p.photoType).filter(Boolean)
      ) as Set<PhotoType>;

      const missingPhotos = REQUIRED_PHOTO_TYPES.filter(
        (type) => !uploadedPhotoTypes.has(type)
      );

      const uploadedPhotosCount = uploadedPhotoTypes.size;
      const completionPercentage = Math.round(
        ((uploadedPhotosCount + (video ? 1 : 0)) / 7) * 100
      );

      return {
        isValid: missingPhotos.length === 0 && !!video,
        missingPhotos,
        hasVideo: !!video,
        completionPercentage,
        canSubmit: uploadedPhotosCount >= 1, // At least one photo required
      };
    },
    []
  );

  const reset = useCallback(() => {
    setValidation(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    validation,
    isLoading,
    error,
    validateMedia,
    checkRequiredMedia,
    reset,
  };
}

/**
 * Get checklist from validation result
 */
export function getChecklistFromValidation(
  validation: MediaValidationResult
): RequiredMediaChecklist {
  const uploadedPhotos = REQUIRED_PHOTO_TYPES.filter(
    (type) => !validation.missingPhotos.includes(type)
  );

  return {
    photos: {
      front: uploadedPhotos.includes('front'),
      rear: uploadedPhotos.includes('rear'),
      left: uploadedPhotos.includes('left'),
      right: uploadedPhotos.includes('right'),
      interior: uploadedPhotos.includes('interior'),
      engineBay: uploadedPhotos.includes('engineBay'),
    },
    video: validation.hasVideo,
  };
}
