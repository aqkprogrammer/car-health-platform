import { apiClient } from './client';

export const dealerApi = {
  /**
   * Get dealer dashboard data
   */
  async getDashboard(): Promise<any> {
    const response = await apiClient.get('/dealer/dashboard');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Get dealer subscription details
   */
  async getSubscription(): Promise<any> {
    const response = await apiClient.get('/dealer/subscription');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Bulk upload cars via CSV
   */
  async bulkUpload(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/dealer/bulk-upload', formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary for FormData
      },
    });

    if (response.error) {
      throw new Error(response.error.message);
    }

    return response.data;
  },
};
