import { apiClient } from './client';

export interface UpdateUserDto {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface UpdateRoleDto {
  role: 'buyer' | 'seller' | 'dealer';
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export interface SaveCarDto {
  listingId: string;
  notes?: string;
}

export const usersApi = {
  /**
   * Get current user profile
   */
  async getProfile(): Promise<any> {
    const response = await apiClient.get('/users/profile');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserDto): Promise<any> {
    const response = await apiClient.put('/users/profile', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Update user role
   */
  async updateRole(data: UpdateRoleDto): Promise<any> {
    const response = await apiClient.put('/users/role', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordDto): Promise<void> {
    const response = await apiClient.put('/users/password', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
  },

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(): Promise<void> {
    const response = await apiClient.delete('/users/profile');
    if (response.error) {
      throw new Error(response.error.message);
    }
  },

  /**
   * Get user uploaded cars (reports)
   */
  async getUploadedCars(): Promise<any[]> {
    const response = await apiClient.get('/users/uploaded-cars');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || [];
  },

  /**
   * Get user purchased reports
   */
  async getPurchasedReports(): Promise<any[]> {
    const response = await apiClient.get('/users/purchased-reports');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || [];
  },

  /**
   * Get user saved cars
   */
  async getSavedCars(): Promise<any[]> {
    const response = await apiClient.get('/users/saved-cars');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || [];
  },

  /**
   * Save a car to favorites
   */
  async saveCar(data: SaveCarDto): Promise<any> {
    const response = await apiClient.post('/users/saved-cars', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Unsave a car
   */
  async unsaveCar(listingId: string): Promise<void> {
    const response = await apiClient.delete(`/users/saved-cars/${listingId}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
  },

  /**
   * Get user activity history
   */
  async getActivityHistory(limit = 50, offset = 0): Promise<{ activities: any[]; total: number }> {
    const response = await apiClient.get(
      `/users/activity?limit=${limit}&offset=${offset}`
    );
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || { activities: [], total: 0 };
  },
};
