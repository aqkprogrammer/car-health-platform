import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { AIJobsService } from './ai-jobs.service';
import { CreateAIJobDto } from './dto/create-ai-job.dto';
import { AIJobResponseDto } from './dto/ai-job-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@ApiTags('ai-jobs')
@Controller('v1/ai-jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AIJobsController {
  constructor(private readonly aiJobsService: AIJobsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new AI processing job' })
  @ApiResponse({
    status: 201,
    description: 'AI job created and enqueued successfully',
    type: AIJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async createJob(@Body() createJobDto: CreateAIJobDto): Promise<AIJobResponseDto> {
    const job = await this.aiJobsService.createJob(createJobDto);
    return this.mapToResponseDto(job);
  }

  @Get(':jobId')
  @ApiOperation({ summary: 'Get AI job status by ID' })
  @ApiParam({ name: 'jobId', description: 'AI job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    type: AIJobResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async getJob(@Param('jobId') jobId: string): Promise<AIJobResponseDto> {
    const job = await this.aiJobsService.getJob(jobId);
    return this.mapToResponseDto(job);
  }

  @Post(':jobId/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Retry a failed AI job' })
  @ApiParam({ name: 'jobId', description: 'AI job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job re-enqueued for retry successfully',
    type: AIJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot retry job (not failed or max retries reached)' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async retryJob(@Param('jobId') jobId: string): Promise<AIJobResponseDto> {
    const job = await this.aiJobsService.retryJob(jobId);
    return this.mapToResponseDto(job);
  }

  @Post(':jobId/cancel')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Cancel an AI job (Admin only)' })
  @ApiParam({ name: 'jobId', description: 'AI job ID' })
  @ApiResponse({
    status: 200,
    description: 'Job cancelled successfully',
    type: AIJobResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Cannot cancel job (already completed or cancelled)' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Job not found' })
  async cancelJob(@Param('jobId') jobId: string): Promise<AIJobResponseDto> {
    const job = await this.aiJobsService.cancelJob(jobId);
    return this.mapToResponseDto(job);
  }

  /**
   * Map AIJob entity to response DTO
   */
  private mapToResponseDto(job: any): AIJobResponseDto {
    return {
      jobId: job.jobId,
      status: job.status,
      progressMessage: job.progressMessage,
      errorReason: job.errorReason,
      attemptCount: job.attemptCount,
      inputPayload: job.inputPayload,
      resultPayload: job.resultPayload,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
    };
  }
}
