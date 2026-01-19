import { apiClient } from './client';

export enum PaymentType {
  REPORT = 'report',
  SUBSCRIPTION = 'subscription',
}

export interface CreatePaymentDto {
  reportId: string;
  amount: number;
  currency: string;
  type: PaymentType;
}

export const paymentsApi = {
  /**
   * Create payment checkout
   */
  async checkout(data: CreatePaymentDto): Promise<any> {
    const response = await apiClient.post('/payments/checkout', data);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Get payment status by payment ID
   */
  async getStatus(paymentId: string): Promise<any> {
    const response = await apiClient.get(`/payments/status/${paymentId}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Process refund for a payment
   */
  async refund(paymentId: string): Promise<any> {
    const response = await apiClient.post(`/payments/refund/${paymentId}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },
};
