import { ApiProperty } from '@nestjs/swagger';
import { AIJobStatus } from '../enums/ai-job-status.enum';

export class AIJobResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Unique job identifier',
  })
  jobId: string;

  @ApiProperty({
    enum: AIJobStatus,
    example: AIJobStatus.PENDING,
    description: 'Current status of the job',
  })
  status: AIJobStatus;

  @ApiProperty({
    example: 'Processing car images...',
    description: 'Current progress message',
    required: false,
  })
  progressMessage?: string;

  @ApiProperty({
    example: 'Failed to process images',
    description: 'Error message if job failed',
    required: false,
  })
  errorReason?: string;

  @ApiProperty({
    example: 1,
    description: 'Number of processing attempts',
  })
  attemptCount: number;

  @ApiProperty({
    example: { carId: '123e4567-e89b-12d3-a456-426614174000' },
    description: 'Input payload for the job',
  })
  inputPayload: Record<string, any>;

  @ApiProperty({
    example: { result: 'success', score: 85 },
    description: 'Result payload from AI processing',
    required: false,
  })
  resultPayload?: Record<string, any>;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'Job creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:05:00.000Z',
    description: 'Job completion timestamp',
    required: false,
  })
  completedAt?: Date;
}
