import { Controller, Get, Post, Body, UseGuards, Request, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { CreateAnalysisJobDto } from './dto/create-analysis-job.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new car health report' })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({ status: 201, description: 'Report created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid report data' })
  async create(@Body() createReportDto: CreateReportDto, @Request() req) {
    return this.reportsService.create(createReportDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reports for current user' })
  @ApiResponse({ status: 200, description: 'Reports retrieved successfully' })
  async findAll(@Request() req) {
    return this.reportsService.findAll(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findOne(@Param('id') id: string, @Request() req) {
    return this.reportsService.findOne(id, req.user.userId);
  }

  @Get('car/:carId')
  @ApiOperation({ summary: 'Get report by car ID' })
  @ApiParam({ name: 'carId', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Report retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async findByCarId(@Param('carId') carId: string, @Request() req) {
    const report = await this.reportsService.findByCarId(carId, req.user.userId);
    if (!report) {
      throw new NotFoundException('Report not found for this car');
    }
    return report;
  }

  @Post(':id/analysis-job')
  @ApiOperation({ summary: 'Create AI analysis job for a report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiBody({ type: CreateAnalysisJobDto })
  @ApiResponse({ status: 200, description: 'Analysis job created successfully' })
  @ApiResponse({ status: 404, description: 'Report not found' })
  async createAnalysisJob(
    @Param('id') id: string,
    @Request() req,
    @Body() createAnalysisJobDto: CreateAnalysisJobDto,
  ) {
    return this.reportsService.createAnalysisJob(id, req.user.userId, createAnalysisJobDto.carId);
  }
}
