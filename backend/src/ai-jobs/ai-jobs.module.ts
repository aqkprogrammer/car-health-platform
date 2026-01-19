import { Module, forwardRef } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AIJobsController } from './ai-jobs.controller';
import { AIJobsService } from './ai-jobs.service';
import { AIJobProcessor } from './ai-job.processor';
import { AIJobRepository } from './repositories/ai-job.repository';
import { CarsModule } from '../cars/cars.module';
import { MediaModule } from '../media/media.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    // Configure BullMQ queue
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    // Register AI jobs queue with exponential backoff retry strategy
    BullModule.registerQueue({
      name: 'ai-jobs',
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000, // Initial delay of 2 seconds
        },
        removeOnComplete: {
          age: 24 * 3600, // Keep completed jobs for 24 hours
          count: 1000, // Keep max 1000 completed jobs
        },
        removeOnFail: {
          age: 7 * 24 * 3600, // Keep failed jobs for 7 days
        },
      },
    }),
    // Import CarsModule to access CarsService (use forwardRef to avoid circular dependency)
    forwardRef(() => CarsModule),
    // Import MediaModule to access MediaService
    forwardRef(() => MediaModule),
    // Import ReportsModule to create reports
    ReportsModule,
  ],
  controllers: [AIJobsController],
  providers: [AIJobsService, AIJobProcessor, AIJobRepository],
  exports: [AIJobsService],
})
export class AIJobsModule {}
