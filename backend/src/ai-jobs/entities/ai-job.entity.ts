import { AIJobStatus } from '../enums/ai-job-status.enum';

export interface AIJob {
  jobId: string;
  carId: string;
  status: AIJobStatus;
  progressMessage?: string;
  errorReason?: string;
  attemptCount: number;
  inputPayload: Record<string, any>;
  resultPayload?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}
