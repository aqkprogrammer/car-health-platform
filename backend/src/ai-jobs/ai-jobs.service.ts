import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { AIJobRepository } from './repositories/ai-job.repository';
import { AIJob } from './entities/ai-job.entity';
import { AIJobStatus } from './enums/ai-job-status.enum';
import { CreateAIJobDto } from './dto/create-ai-job.dto';
import { CarsService } from '../cars/cars.service';

@Injectable()
export class AIJobsService {
  private readonly logger = new Logger(AIJobsService.name);
  private readonly MAX_RETRIES = 3;

  constructor(
    private readonly jobRepository: AIJobRepository,
    @InjectQueue('ai-jobs') private readonly queue: Queue,
    @Inject(forwardRef(() => CarsService))
    private readonly carsService: CarsService,
  ) {}

  /**
   * Create a new AI job and enqueue it for processing
   */
  async createJob(createJobDto: CreateAIJobDto): Promise<AIJob> {
    const { carId } = createJobDto;

    // Validate car exists
    try {
      await this.carsService.findOne(carId);
    } catch (error) {
      this.logger.error(`Car not found: ${carId}`, error);
      throw new NotFoundException(`Car with ID ${carId} not found`);
    }

    // Create job record
    const jobId = randomUUID();
    const job: AIJob = {
      jobId,
      carId,
      status: AIJobStatus.PENDING,
      attemptCount: 0,
      inputPayload: {
        carId,
        createdAt: new Date().toISOString(),
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save job
    const savedJob = await this.jobRepository.create(job);

    // Enqueue job for processing
    try {
      await this.queue.add('process-ai-job', {
        jobId,
        carId,
      });
      this.logger.log(`Job ${jobId} enqueued for car ${carId}`);
    } catch (error) {
      this.logger.error(`Failed to enqueue job ${jobId}`, error);
      // Update job status to failed
      await this.jobRepository.update(jobId, {
        status: AIJobStatus.FAILED,
        errorReason: 'Failed to enqueue job',
      });
      throw new BadRequestException('Failed to enqueue job for processing');
    }

    return savedJob;
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<AIJob> {
    try {
      return await this.jobRepository.findById(jobId);
    } catch (error) {
      this.logger.error(`Job not found: ${jobId}`, error);
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }
  }

  /**
   * Retry a failed job
   */
  async retryJob(jobId: string): Promise<AIJob> {
    const job = await this.getJob(jobId);

    // Only allow retry for failed jobs
    if (job.status !== AIJobStatus.FAILED) {
      throw new BadRequestException(
        `Cannot retry job. Current status is ${job.status}. Only failed jobs can be retried.`,
      );
    }

    // Check retry limit
    if (job.attemptCount >= this.MAX_RETRIES) {
      throw new BadRequestException(
        `Maximum retry limit (${this.MAX_RETRIES}) reached for job ${jobId}`,
      );
    }

    // Update job status and increment attempt count
    const updatedJob = await this.jobRepository.update(jobId, {
      status: AIJobStatus.PENDING,
      attemptCount: job.attemptCount + 1,
      errorReason: undefined,
      progressMessage: 'Job queued for retry',
    });

    // Re-enqueue job
    try {
      await this.queue.add('process-ai-job', {
        jobId,
        carId: job.carId,
      });
      this.logger.log(`Job ${jobId} re-enqueued for retry (attempt ${updatedJob.attemptCount})`);
    } catch (error) {
      this.logger.error(`Failed to re-enqueue job ${jobId}`, error);
      await this.jobRepository.update(jobId, {
        status: AIJobStatus.FAILED,
        errorReason: 'Failed to re-enqueue job for retry',
      });
      throw new BadRequestException('Failed to re-enqueue job for processing');
    }

    return updatedJob;
  }

  /**
   * Cancel a job (admin only)
   */
  async cancelJob(jobId: string): Promise<AIJob> {
    const job = await this.getJob(jobId);

    // Check if job can be cancelled
    if (job.status === AIJobStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed job');
    }

    if (job.status === AIJobStatus.CANCELLED) {
      throw new BadRequestException('Job is already cancelled');
    }

    // Update job status
    const updatedJob = await this.jobRepository.update(jobId, {
      status: AIJobStatus.CANCELLED,
      progressMessage: 'Job cancelled by admin',
    });

    this.logger.log(`Job ${jobId} cancelled by admin`);

    // Note: In production, you might want to remove the job from the queue
    // For now, we'll just mark it as cancelled

    return updatedJob;
  }

  /**
   * Update job status (called by processor)
   */
  async updateJobStatus(
    jobId: string,
    status: AIJobStatus,
    updates?: Partial<AIJob>,
  ): Promise<AIJob> {
    const updateData: Partial<AIJob> = {
      status,
      ...updates,
    };

    if (status === AIJobStatus.COMPLETED || status === AIJobStatus.FAILED) {
      updateData.completedAt = new Date();
    }

    return this.jobRepository.update(jobId, updateData);
  }
}
