import { Injectable } from '@nestjs/common';
import { AIJob } from '../entities/ai-job.entity';
import { AIJobStatus } from '../enums/ai-job-status.enum';

@Injectable()
export class AIJobRepository {
  private jobs: Map<string, AIJob> = new Map();

  async create(job: AIJob): Promise<AIJob> {
    this.jobs.set(job.jobId, { ...job });
    return this.findById(job.jobId);
  }

  async findById(jobId: string): Promise<AIJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }
    return { ...job };
  }

  async update(jobId: string, updates: Partial<AIJob>): Promise<AIJob> {
    const job = this.jobs.get(jobId);
    if (!job) {
      throw new Error(`Job with ID ${jobId} not found`);
    }

    const updated = {
      ...job,
      ...updates,
      updatedAt: new Date(),
    };

    this.jobs.set(jobId, updated);
    return { ...updated };
  }

  async findAll(): Promise<AIJob[]> {
    return Array.from(this.jobs.values());
  }

  async findByStatus(status: AIJobStatus): Promise<AIJob[]> {
    return Array.from(this.jobs.values()).filter((job) => job.status === status);
  }

  async findByCarId(carId: string): Promise<AIJob[]> {
    return Array.from(this.jobs.values()).filter((job) => job.carId === carId);
  }
}
