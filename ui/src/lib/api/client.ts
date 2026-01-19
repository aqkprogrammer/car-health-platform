import { API_CONFIG, getAuthToken, removeAuthToken } from './config';

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    status: number;
  };
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = getAuthToken();
    const url = `${this.baseURL}${endpoint}`;

    const headers: HeadersInit = {
      ...options.headers,
    };
    
    // Only set Content-Type for JSON, not for FormData
    // Check if body is FormData (it might be set in options or passed from post/put)
    const isFormData = options.body instanceof FormData;
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - clear token and redirect to login
      if (response.status === 401) {
        removeAuthToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return {
          error: {
            message: 'Unauthorized. Please login again.',
            status: 401,
          },
        };
      }

      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json() : { message: response.statusText };
        return {
          error: {
            message: errorData.message || `HTTP error! status: ${response.status}`,
            status: response.status,
          },
        };
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as T };
      }

      const data = isJson ? await response.json() : await response.text();
      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Network error occurred',
          status: 0,
        },
      };
    }
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    // Handle FormData - don't stringify it
    const isFormData = data instanceof FormData;
    const body = data ? (isFormData ? data : JSON.stringify(data)) : undefined;
    
    // For FormData, don't set Content-Type header - let browser set it with boundary
    const headers = isFormData 
      ? { ...options?.headers } // Remove Content-Type if present, browser will set it
      : options?.headers;
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body,
      headers,
    });
  }

  async put<T>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // For file uploads (presigned URLs)
  async uploadFile(url: string, file: File, options?: RequestInit): Promise<Response> {
    return fetch(url, {
      ...options,
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
        ...options?.headers,
      },
    });
  }
}

export const apiClient = new ApiClient();
