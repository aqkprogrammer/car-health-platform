import { apiClient } from './client';
import { setAuthToken, removeAuthToken } from './config';

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email?: string;
  password?: string;
  phone?: string;
  role?: 'buyer' | 'seller' | 'dealer';
}

export interface OTPRequestDto {
  phone: string;
}

export interface OTPVerifyDto {
  phone: string;
  otp: string;
  role?: 'buyer' | 'seller' | 'dealer';
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email?: string;
    phone?: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

export const authApi = {
  /**
   * Register a new user
   */
  async register(data: RegisterDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    if (response.data?.access_token) {
      setAuthToken(response.data.access_token);
    }
    return response.data!;
  },

  /**
   * Login with email and password
   */
  async login(data: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    if (response.data?.access_token) {
      setAuthToken(response.data.access_token);
    }
    return response.data!;
  },

  /**
   * Request OTP for phone login
   */
  async requestOTP(data: OTPRequestDto): Promise<{ message: string; expiresIn: number }> {
    const response = await apiClient.post<{ message: string; expiresIn: number }>(
      '/auth/login/phone',
      data
    );
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data!;
  },

  /**
   * Verify OTP and login
   */
  async verifyOTP(data: OTPVerifyDto): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login/verify-otp', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    if (response.data?.access_token) {
      setAuthToken(response.data.access_token);
    }
    return response.data!;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    removeAuthToken();
  },

  /**
   * Get current user profile from auth endpoint
   */
  async getProfile(): Promise<any> {
    const response = await apiClient.get('/auth/profile');
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },
};
