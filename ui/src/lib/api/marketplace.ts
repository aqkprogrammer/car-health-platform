import { apiClient } from './client';

export interface CreateListingDto {
  reportId: string;
  price: number;
  currency: string;
  city?: string;
  state?: string;
}

export interface MarketplaceFilters {
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  state?: string;
  make?: string;
  model?: string;
}

export const marketplaceApi = {
  /**
   * Get all marketplace listings with optional filters
   */
  async getAll(filters?: MarketplaceFilters): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.minPrice !== undefined) {
        params.append('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params.append('maxPrice', filters.maxPrice.toString());
      }
      if (filters.city) {
        params.append('city', filters.city);
      }
      if (filters.state) {
        params.append('state', filters.state);
      }
      if (filters.make) {
        params.append('make', filters.make);
      }
      if (filters.model) {
        params.append('model', filters.model);
      }
    }
    const query = params.toString();
    const endpoint = query ? `/marketplace?${query}` : '/marketplace';
    
    const response = await apiClient.get(endpoint);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data || [];
  },

  /**
   * Get a specific listing by ID
   */
  async getById(id: string): Promise<any> {
    const response = await apiClient.get(`/marketplace/${id}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Create a new marketplace listing
   */
  async create(data: CreateListingDto): Promise<any> {
    const response = await apiClient.post('/marketplace', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },
};
