import { apiClient } from './client';
import { API_CONFIG, getAuthToken } from './config';

export type MediaType = 'photo' | 'video';
export type PhotoType = 'front' | 'rear' | 'left' | 'right' | 'interior' | 'engineBay';

export interface RequestUploadDto {
  type: MediaType;
  photoType?: PhotoType;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface RegisterMediaDto {
  storageKey: string;
  storageUrl: string;
  thumbnailUrl?: string;
  metadata?: any;
}

export interface UploadAuthorizationResponse {
  mediaId: string;
  uploadUrl: string;
  expiresIn: number;
}

export interface MediaValidationResponse {
  isValid: boolean;
  missingPhotos: PhotoType[];
  hasVideo: boolean;
  warnings?: string[];
  completionPercentage?: number;
}

export interface MediaChecklistResponse {
  requiredPhotos: Array<{
    type: PhotoType;
    label: string;
    description: string;
    isRequired: boolean;
  }>;
  requiredVideo: {
    isRequired: boolean;
    description: string;
  };
  guidance: {
    photoTips: string[];
    videoTips: string[];
  };
}

export const mediaApi = {
  /**
   * Request upload authorization (presigned URL)
   */
  async requestUploadAuthorization(
    carId: string,
    data: RequestUploadDto
  ): Promise<UploadAuthorizationResponse> {
    const response = await apiClient.post<UploadAuthorizationResponse>(
      `/cars/${carId}/media/upload-request`,
      data
    );
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data!;
  },

  /**
   * Register media metadata after upload
   */
  async registerMedia(
    carId: string,
    mediaId: string,
    data: RegisterMediaDto
  ): Promise<any> {
    const response = await apiClient.put(
      `/cars/${carId}/media/${mediaId}/register`,
      data
    );
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Get all media for a car
   */
  async getMediaByCar(carId: string): Promise<any[]> {
    const response = await apiClient.get(`/cars/${carId}/media`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || [];
  },

  /**
   * Get required media checklist and guidance
   */
  async getRequiredMediaChecklist(carId: string): Promise<MediaChecklistResponse> {
    const response = await apiClient.get<MediaChecklistResponse>(
      `/cars/${carId}/media/checklist`
    );
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data!;
  },

  /**
   * Validate required media presence with warnings
   */
  async validateRequiredMedia(carId: string): Promise<MediaValidationResponse> {
    const response = await apiClient.get<MediaValidationResponse>(
      `/cars/${carId}/media/validate`
    );
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data!;
  },

  /**
   * Delete media
   */
  async deleteMedia(carId: string, mediaId: string): Promise<void> {
    const response = await apiClient.delete(`/cars/${carId}/media/${mediaId}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
  },

  /**
   * Replace media (delete old and request new upload)
   */
  async replaceMedia(
    carId: string,
    mediaId: string,
    data: RequestUploadDto
  ): Promise<UploadAuthorizationResponse> {
    const response = await apiClient.post<UploadAuthorizationResponse>(
      `/cars/${carId}/media/${mediaId}/replace`,
      data
    );
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data!;
  },

  /**
   * Upload file directly through backend (bypasses CORS)
   */
  async uploadFileDirectly(
    carId: string,
    mediaId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ storageKey: string; storageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Track upload progress
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress);
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          try {
            const error = JSON.parse(xhr.responseText);
            reject(new Error(error.message || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      const token = getAuthToken();
      const apiBaseUrl = API_CONFIG.baseURL;

      xhr.open('POST', `${apiBaseUrl}/cars/${carId}/media/${mediaId}/upload`);
      
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.send(formData);
    });
  },
};
