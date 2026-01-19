import { apiClient } from './client';

export interface CreateReportDto {
  make: string;
  model: string;
  year: number;
  carDetails?: any;
  media?: any;
}

export const reportsApi = {
  /**
   * Create a new car health report
   */
  async create(data: CreateReportDto): Promise<any> {
    const response = await apiClient.post('/reports', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Get all reports for current user
   */
  async getAll(): Promise<any[]> {
    const response = await apiClient.get('/reports');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || [];
  },

  /**
   * Get a specific report by ID
   */
  async getById(id: string): Promise<any> {
    const response = await apiClient.get(`/reports/${id}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Create AI analysis job for a report
   */
  async createAnalysisJob(reportId: string, carId: string): Promise<any> {
    const response = await apiClient.post(`/reports/${reportId}/analysis-job`, { carId });
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Get report by car ID
   */
  async getByCarId(carId: string): Promise<any> {
    const response = await apiClient.get(`/reports/car/${carId}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },
};
