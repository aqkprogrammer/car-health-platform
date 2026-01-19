import { apiClient } from './client';

export type FuelType = 'petrol' | 'diesel' | 'electric' | 'hybrid' | 'cng' | 'lpg';
export type TransmissionType = 'manual' | 'automatic' | 'cvt' | 'amt';
export type CarStatus = 'draft' | 'media_uploaded' | 'submitted' | 'analyzing' | 'report_ready';

export interface CreateCarDto {
  make: string;
  model: string;
  year: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  kilometersDriven?: number;
  ownershipCount?: number;
  vin?: string;
  registrationNumber?: string;
  color?: string;
  city?: string;
  state?: string;
  country?: string;
  additionalDetails?: any;
  status?: CarStatus;
}

export interface UpdateCarDto {
  make?: string;
  model?: string;
  year?: number;
  fuelType?: FuelType;
  transmission?: TransmissionType;
  kilometersDriven?: number;
  ownershipCount?: number;
  vin?: string;
  registrationNumber?: string;
  color?: string;
  city?: string;
  state?: string;
  country?: string;
  additionalDetails?: any;
  isActive?: boolean;
  status?: CarStatus;
}

export interface UpdateStatusDto {
  status: CarStatus;
  note?: string;
}

export const carsApi = {
  /**
   * Create a new car
   */
  async create(data: CreateCarDto): Promise<any> {
    const response = await apiClient.post('/cars', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Get all cars (optionally filtered)
   */
  async getAll(userId?: string, status?: CarStatus): Promise<any[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (status) params.append('status', status);
    const query = params.toString();
    const endpoint = query ? `/cars?${query}` : '/cars';
    
    const response = await apiClient.get(endpoint);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || [];
  },

  /**
   * Get current user's cars
   */
  async getMyCars(): Promise<any[]> {
    const response = await apiClient.get('/cars/my-cars');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || [];
  },

  /**
   * Get car by ID
   */
  async getById(id: string): Promise<any> {
    const response = await apiClient.get(`/cars/${id}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Update car details
   */
  async update(id: string, data: UpdateCarDto): Promise<any> {
    const response = await apiClient.put(`/cars/${id}`, data);
    if (response.error) {
      const error: any = new Error(response.error.message);
      error.status = response.error.status;
      throw error;
    }
    return response.data;
  },

  /**
   * Delete car (soft delete)
   */
  async delete(id: string): Promise<void> {
    const response = await apiClient.delete(`/cars/${id}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
  },

  /**
   * Update car status
   */
  async updateStatus(id: string, data: UpdateStatusDto): Promise<any> {
    const response = await apiClient.put(`/cars/${id}/status`, data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Get step completion status
   */
  async getStepCompletionStatus(id: string): Promise<{
    step1Complete: boolean;
    step2Complete: boolean;
    readyForSubmission: boolean;
    step1Details: {
      hasCarDetails: boolean;
      hasRequiredFields: boolean;
      missingFields: string[];
    };
    step2Details: {
      uploadedPhotosCount: number;
      requiredPhotosCount: number;
      hasVideo: boolean;
      missingPhotos: string[];
    };
  }> {
    const response = await apiClient.get(`/cars/${id}/steps/status`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data!;
  },

  /**
   * Get full submission summary (car + media)
   */
  async getSubmissionSummary(id: string): Promise<{
    car: any;
    media: any[];
    canEdit: boolean;
    isLocked: boolean;
  }> {
    const response = await apiClient.get(`/cars/${id}/submission-summary`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data!;
  },

  /**
   * Lock car data and submit for AI analysis
   */
  async lockAndSubmitForAnalysis(id: string, reportId?: string): Promise<any> {
    const response = await apiClient.post(`/cars/${id}/lock-and-submit`, { reportId });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Submit car for AI analysis (validates, locks, and creates job)
   */
  async submit(id: string): Promise<{ jobId: string; status: string }> {
    const response = await apiClient.post(`/cars/${id}/submit`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },
};
