/**
 * Hook for managing media upload with progress tracking
 */

import { useState, useCallback } from 'react';
import { mediaApi, apiClient } from '@/lib/api';
import { getImageDimensions, getVideoMetadata, extractStorageKeyFromUrl } from '@/lib/utils/media';
import { validateFile } from '@/lib/utils/validation';
import { PhotoType } from '@/types/car';

export interface UploadProgress {
  mediaId: string;
  type: 'photo' | 'video';
  photoType?: PhotoType;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'registering' | 'completed' | 'error';
  error?: string;
}

export interface UseMediaUploadReturn {
  uploads: Map<string, UploadProgress>;
  uploadMedia: (
    carId: string,
    file: File,
    type: 'photo' | 'video',
    photoType?: PhotoType
  ) => Promise<void>;
  clearUpload: (mediaId: string) => void;
  clearAllUploads: () => void;
  getUploadProgress: (mediaId: string) => UploadProgress | undefined;
  isUploading: boolean;
}

export function useMediaUpload(): UseMediaUploadReturn {
  const [uploads, setUploads] = useState<Map<string, UploadProgress>>(new Map());
  const [isUploading, setIsUploading] = useState(false);

  const updateUpload = useCallback((mediaId: string, updates: Partial<UploadProgress>) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      const existing = newMap.get(mediaId);
      if (existing) {
        newMap.set(mediaId, { ...existing, ...updates });
      }
      return newMap;
    });
  }, []);

  const uploadMedia = useCallback(
    async (
      carId: string,
      file: File,
      type: 'photo' | 'video',
      photoType?: PhotoType
    ): Promise<void> => {
      // Validate file
      let duration: number | undefined;
      if (type === 'video') {
        try {
          const metadata = await getVideoMetadata(file);
          duration = metadata.duration;
        } catch (err) {
          throw new Error('Failed to read video metadata');
        }
      }

      const validation = validateFile({
        file,
        isVideo: type === 'video',
        checkDuration: type === 'video',
        duration,
      });

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      setIsUploading(true);
      let mediaId = '';

      try {
        // Extract metadata
        let width: number | undefined;
        let height: number | undefined;

        if (type === 'photo') {
          const dimensions = await getImageDimensions(file);
          width = dimensions.width;
          height = dimensions.height;
        } else if (type === 'video') {
          const metadata = await getVideoMetadata(file);
          width = metadata.width;
          height = metadata.height;
          duration = metadata.duration;
        }

        // Request upload authorization
        const authResponse = await mediaApi.requestUploadAuthorization(carId, {
          type,
          photoType,
          fileName: file.name,
          mimeType: file.type,
          fileSize: file.size,
          width,
          height,
          duration,
        });

        mediaId = authResponse.mediaId;

        // Initialize upload progress
        setUploads((prev) => {
          const newMap = new Map(prev);
          newMap.set(mediaId, {
            mediaId,
            type,
            photoType,
            fileName: file.name,
            progress: 0,
            status: 'pending',
          });
          return newMap;
        });

        // Upload file to presigned URL with progress tracking
        updateUpload(mediaId, { status: 'uploading', progress: 0 });

        let uploadSuccess = false;
        let usedProxy = false;

        try {
          // Try presigned URL upload first
          const uploadResponse = await uploadFileWithProgress(
            authResponse.uploadUrl,
            file,
            (progress) => {
              updateUpload(mediaId, { progress: Math.round(progress * 0.9) }); // 90% for upload
            }
          );

          if (uploadResponse.ok) {
            uploadSuccess = true;
          }
        } catch (error: any) {
          // If CORS error or presigned URL fails, fallback to backend proxy
          if (error.message?.includes('CORS') || error.message?.includes('Upload failed')) {
            console.warn('Presigned URL upload failed, falling back to backend proxy:', error.message);
            
            // Use backend proxy endpoint (handles upload and registration)
            await mediaApi.uploadFileDirectly(
              carId,
              mediaId,
              file,
              (progress) => {
                updateUpload(mediaId, { progress: Math.round(progress * 0.9) }); // 90% for upload
              }
            );
            
            uploadSuccess = true;
            usedProxy = true;
          } else {
            throw error;
          }
        }

        if (!uploadSuccess) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        // Register media metadata (only if we used presigned URL - proxy handles it automatically)
        if (!usedProxy) {
          updateUpload(mediaId, { status: 'registering', progress: 90 });

          const storageKey = extractStorageKeyFromUrl(authResponse.uploadUrl);
          const storageUrl = authResponse.uploadUrl.split('?')[0];

          await mediaApi.registerMedia(carId, mediaId, {
            storageKey,
            storageUrl,
            thumbnailUrl: type === 'photo' ? storageUrl : undefined,
            metadata: {
              originalFileName: file.name,
              uploadedAt: new Date().toISOString(),
              ...(width && height && { dimensions: { width, height } }),
              ...(duration && { duration }),
            },
          });
        }

        // Mark as completed
        updateUpload(mediaId, { status: 'completed', progress: 100 });
      } catch (error: any) {
        const errorMessage = error.message || 'Upload failed';
        if (mediaId) {
          updateUpload(mediaId, {
            status: 'error',
            error: errorMessage,
          });
        }
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [updateUpload]
  );

  const clearUpload = useCallback((mediaId: string) => {
    setUploads((prev) => {
      const newMap = new Map(prev);
      newMap.delete(mediaId);
      return newMap;
    });
  }, []);

  const clearAllUploads = useCallback(() => {
    setUploads(new Map());
  }, []);

  const getUploadProgress = useCallback(
    (mediaId: string): UploadProgress | undefined => {
      return uploads.get(mediaId);
    },
    [uploads]
  );

  return {
    uploads,
    uploadMedia,
    clearUpload,
    clearAllUploads,
    getUploadProgress,
    isUploading,
  };
}

/**
 * Upload file with progress tracking
 */
async function uploadFileWithProgress(
  url: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(new Response(xhr.response, { status: xhr.status }));
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    });

    xhr.addEventListener('error', () => {
      // Check if it's a CORS error
      if (xhr.status === 0) {
        reject(new Error('CORS error: Check S3 bucket CORS configuration. See backend/S3_CORS_SETUP.md for setup instructions.'));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText || 'Network error'}`));
      }
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload aborted'));
    });

    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.send(file);
  });
}
