import { apiClient } from './client';

export type AIJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface AIJob {
  jobId: string;
  status: AIJobStatus;
  progressMessage?: string;
  errorReason?: string;
  attemptCount: number;
  inputPayload: Record<string, any>;
  resultPayload?: Record<string, any>;
  createdAt: Date;
  completedAt?: Date;
}

export const aiJobsApi = {
  /**
   * Get AI job status by ID
   */
  async getJob(jobId: string): Promise<AIJob> {
    const response = await apiClient.get(`/v1/ai-jobs/${jobId}`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },

  /**
   * Retry a failed AI job
   */
  async retryJob(jobId: string): Promise<AIJob> {
    const response = await apiClient.post(`/v1/ai-jobs/${jobId}/retry`);
    if (response.error) {
      throw new Error(response.error.message);
    }
    return response.data;
  },
};
