import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { UsersService } from '../users/users.service';
import { ActivityType } from '../users/entities/user-activity.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepository: Repository<Report>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {}

  async create(createReportDto: CreateReportDto, userId: string): Promise<Report> {
    const report = this.reportsRepository.create({
      ...createReportDto,
      userId,
      status: 'pending', // Initial status
    });
    const savedReport = await this.reportsRepository.save(report);

    // Track activity
    await this.usersService.trackActivity(
      userId,
      ActivityType.REPORT_CREATED,
      'report',
      savedReport.id,
      {
        make: savedReport.make,
        model: savedReport.model,
        year: savedReport.year,
      },
      `Created health report for ${savedReport.make} ${savedReport.model} ${savedReport.year}`,
    );

    return savedReport;
  }

  /**
   * Create AI analysis job for a report
   */
  async createAnalysisJob(reportId: string, userId: string, carId: string): Promise<Report> {
    const report = await this.findOne(reportId, userId);

    // Update report with analysis job metadata
    report.status = 'analyzing';
    report.aiAnalysis = {
      ...report.aiAnalysis,
      jobCreatedAt: new Date().toISOString(),
      carId,
      status: 'queued',
    };

    const updatedReport = await this.reportsRepository.save(report);

    // TODO: In production, this would trigger an actual background job/queue
    // For now, we just mark it as queued
    // Example: await this.jobQueue.add('analyze-car', { reportId, carId, userId });

    return updatedReport;
  }

  async findAll(userId: string): Promise<Report[]> {
    return this.reportsRepository.find({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Report> {
    return this.reportsRepository.findOne({
      where: { id, userId },
    });
  }

  /**
   * Find report by carId
   */
  async findByCarId(carId: string, userId: string): Promise<Report | null> {
    // Use query builder to search in JSONB carDetails field
    const report = await this.reportsRepository
      .createQueryBuilder('report')
      .where('report.userId = :userId', { userId })
      .andWhere("report.carDetails->>'carId' = :carId", { carId })
      .getOne();
    
    return report || null;
  }

  /**
   * Create report from AI result (called by AI job processor)
   */
  async createFromAIResult(data: {
    userId: string;
    carId: string;
    make: string;
    model: string;
    year: number;
    carDetails?: any;
    media?: any;
    aiAnalysis?: any;
    trustScore?: number;
    verdict?: string;
    status?: string;
  }): Promise<Report> {
    const report = this.reportsRepository.create({
      userId: data.userId,
      make: data.make,
      model: data.model,
      year: data.year,
      carDetails: {
        ...data.carDetails,
        carId: data.carId,
      },
      media: data.media,
      aiAnalysis: data.aiAnalysis,
      trustScore: data.trustScore,
      verdict: data.verdict,
      status: data.status || 'completed',
    });

    const savedReport = await this.reportsRepository.save(report);

    // Track activity
    await this.usersService.trackActivity(
      data.userId,
      ActivityType.REPORT_CREATED,
      'report',
      savedReport.id,
      {
        make: savedReport.make,
        model: savedReport.model,
        year: savedReport.year,
        carId: data.carId,
        trustScore: savedReport.trustScore,
      },
      `AI analysis completed for ${savedReport.make} ${savedReport.model} ${savedReport.year}`,
    );

    return savedReport;
  }
}
