import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AIJobsService } from './ai-jobs.service';
import { AIJobStatus } from './enums/ai-job-status.enum';
import { MediaService } from '../media/media.service';
import { MediaType } from '../media/entities/media.entity';
import { ReportsService } from '../reports/reports.service';
import { CarsService } from '../cars/cars.service';
import { CarStatus } from '../cars/entities/car.entity';

interface ProcessAIJobData {
  jobId: string;
  carId: string;
}

interface AIServicePayload {
  jobId: string;
  imageUrls: string[];
  audioUrl?: string;
}

@Processor('ai-jobs')
export class AIJobProcessor extends WorkerHost {
  private readonly logger = new Logger(AIJobProcessor.name);
  private readonly aiServiceBaseUrl: string;
  private readonly requestTimeout = 120000; // 120 seconds

  constructor(
    private readonly aiJobsService: AIJobsService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => MediaService))
    private readonly mediaService: MediaService,
    private readonly reportsService: ReportsService,
    @Inject(forwardRef(() => CarsService))
    private readonly carsService: CarsService,
  ) {
    super();
    this.aiServiceBaseUrl = this.configService.get<string>('AI_SERVICE_BASE_URL', '');
    if (!this.aiServiceBaseUrl) {
      this.logger.warn('AI_SERVICE_BASE_URL not configured');
    }
  }

  async process(job: Job<ProcessAIJobData>): Promise<any> {
    const { jobId, carId } = job.data;
    const attemptsMade = job.attemptsMade || 0;

    this.logger.log(`Processing AI job ${jobId} for car ${carId} (attempt ${attemptsMade + 1})`);

    // Check if job is cancelled
    const currentJob = await this.aiJobsService.getJob(jobId);
    if (currentJob.status === AIJobStatus.CANCELLED) {
      this.logger.log(`Job ${jobId} is cancelled, skipping processing`);
      return null;
    }

    try {
      // Update job status to PROCESSING and attempt count
      await this.aiJobsService.updateJobStatus(jobId, AIJobStatus.PROCESSING, {
        attemptCount: attemptsMade + 1,
        progressMessage: 'Preparing media for AI analysis...',
      });

      // Get car media and generate signed URLs
      const media = await this.mediaService.getMediaByCar(carId);
      const imageUrls: string[] = [];
      let audioUrl: string | undefined;

      for (const item of media) {
        if (!item.isUploaded) continue;

        if (item.type === MediaType.PHOTO) {
          // For photos, use storageUrl (may need to generate signed URL if S3)
          const signedUrl = await this.generateSignedUrl(item);
          if (signedUrl) {
            imageUrls.push(signedUrl);
          }
        } else if (item.type === MediaType.VIDEO) {
          // For videos, use as audioUrl
          const signedUrl = await this.generateSignedUrl(item);
          if (signedUrl) {
            audioUrl = signedUrl;
          }
        }
      }

      if (imageUrls.length === 0) {
        throw new Error('No images found for car');
      }

      this.logger.log(`Found ${imageUrls.length} images${audioUrl ? ' and 1 audio file' : ''} for job ${jobId}`);

      // Prepare payload for AI service
      const payload: AIServicePayload = {
        jobId,
        imageUrls,
        ...(audioUrl && { audioUrl }),
      };

      // Update progress
      await this.aiJobsService.updateJobStatus(jobId, AIJobStatus.PROCESSING, {
        progressMessage: 'Sending request to AI service...',
      });

      // Send HTTP POST request to AI service with timeout
      const aiResponse = await this.callAIService(payload);

      // Store raw AI output
      const rawOutput = typeof aiResponse === 'string' ? JSON.parse(aiResponse) : aiResponse;

      // Update job status to COMPLETED
      await this.aiJobsService.updateJobStatus(jobId, AIJobStatus.COMPLETED, {
        progressMessage: 'AI processing completed successfully',
        resultPayload: rawOutput,
      });

      // Generate report from AI result
      await this.generateReportFromAIResult(carId, jobId, rawOutput);

      this.logger.log(`AI job ${jobId} completed successfully`);

      return rawOutput;
    } catch (error) {
      this.logger.error(`AI job ${jobId} failed (attempt ${attemptsMade + 1})`, error);

      const maxRetries = 3;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

      // Mark as FAILED if max retries reached
      if (attemptsMade >= maxRetries - 1) {
        await this.aiJobsService.updateJobStatus(jobId, AIJobStatus.FAILED, {
          attemptCount: attemptsMade + 1,
          errorReason: errorMessage,
          progressMessage: 'AI processing failed after maximum retries',
        });
        
        // Reset car status to MEDIA_UPLOADED so user can edit and retry
        try {
          const car = await this.carsService.findOne(carId);
          await this.carsService.updateStatus(carId, { status: CarStatus.MEDIA_UPLOADED }, car.userId);
          this.logger.log(`Car ${carId} status reset to MEDIA_UPLOADED after AI job failure`);
        } catch (resetError) {
          this.logger.error(`Failed to reset car status after job failure: ${resetError.message}`);
        }
      } else {
        // Update job with error reason (will be retried by BullMQ)
        await this.aiJobsService.updateJobStatus(jobId, AIJobStatus.PROCESSING, {
          attemptCount: attemptsMade + 1,
          errorReason: errorMessage,
          progressMessage: `Processing failed (attempt ${attemptsMade + 1}/${maxRetries})`,
        });
      }

      // Re-throw to mark job as failed in BullMQ (will trigger retry if configured)
      throw error;
    }
  }

  /**
   * Generate signed URL for media item
   * Uses internal URL (Docker service name) when generating URLs for AI service
   */
  private async generateSignedUrl(media: any): Promise<string | null> {
    try {
      // If storageUrl is already a full URL, return it
      if (media.storageUrl && (media.storageUrl.startsWith('http://') || media.storageUrl.startsWith('https://'))) {
        return media.storageUrl;
      }

      // For local storage, construct URL
      const storageType = this.configService.get<string>('STORAGE_TYPE', 'local');
      if (storageType === 'local') {
        // Use internal URL for Docker networking (accessible from other containers)
        // Falls back to BASE_URL if not set
        const internalBaseUrl = this.configService.get<string>('BACKEND_INTERNAL_URL');
        const baseUrl = internalBaseUrl || this.configService.get<string>('BASE_URL', 'http://localhost:3001');
        return `${baseUrl}/api/cars/${media.carId}/media/files/${media.carId}/${media.type}/${media.fileName}`;
      }

      // For S3, storageUrl should already be set
      return media.storageUrl || null;
    } catch (error) {
      this.logger.warn(`Failed to generate signed URL for media ${media.id}: ${error}`);
      return null;
    }
  }

  /**
   * Call AI service endpoint with timeout
   */
  private async callAIService(payload: AIServicePayload): Promise<any> {
    if (!this.aiServiceBaseUrl) {
      throw new Error('AI_SERVICE_BASE_URL not configured');
    }

    const url = `${this.aiServiceBaseUrl}/analyze`;
    this.logger.log(`Calling AI service: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI service returned ${response.status}: ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text();
      }
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`AI service request timed out after ${this.requestTimeout}ms`);
      }

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed`);
  }

  /**
   * Generate report from AI result
   */
  private async generateReportFromAIResult(carId: string, jobId: string, aiResult: any): Promise<void> {
    try {
      // Get car details
      const car = await this.carsService.findOne(carId);
      
      // Get media for the car
      const media = await this.mediaService.getMediaByCar(carId);

      // Extract scores and issues from AI result
      const exteriorScore = aiResult.exteriorScore || aiResult.exterior?.score || null;
      const engineScore = aiResult.engineScore || aiResult.engine?.score || null;
      const issues = aiResult.issues || [];
      
      // Calculate trust score (average of exterior and engine scores, or use provided score)
      const trustScore = aiResult.trustScore || 
        (exteriorScore && engineScore ? Math.round((exteriorScore + engineScore) / 2) : 
         exteriorScore || engineScore || null);

      // Determine verdict
      let verdict = 'Unknown';
      if (trustScore !== null) {
        if (trustScore >= 80) verdict = 'Excellent';
        else if (trustScore >= 65) verdict = 'Good';
        else if (trustScore >= 50) verdict = 'Fair';
        else verdict = 'Poor';
      }

      // Create report
      const report = await this.reportsService.createFromAIResult({
        userId: car.userId,
        carId,
        make: car.make,
        model: car.model,
        year: car.year,
        carDetails: {
          fuelType: car.fuelType,
          transmission: car.transmission,
          kilometersDriven: car.kilometersDriven,
          ownershipCount: car.ownershipCount,
          city: car.city,
          state: car.state,
        },
        media: media.map(m => ({
          id: m.id,
          type: m.type,
          photoType: m.photoType,
          storageUrl: m.storageUrl,
        })),
        aiAnalysis: {
          jobId,
          ...aiResult,
          exteriorScore,
          engineScore,
          issues,
        },
        trustScore,
        verdict,
        status: 'completed',
      });

      // Update car status to REPORT_READY
      await this.carsService.updateStatus(carId, { status: CarStatus.REPORT_READY }, car.userId);

      this.logger.log(`Report created for car ${carId} from job ${jobId}`);
    } catch (error) {
      this.logger.error(`Failed to generate report for car ${carId}: ${error.message}`, error);
      // Don't throw - report generation failure shouldn't fail the job
    }
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}
