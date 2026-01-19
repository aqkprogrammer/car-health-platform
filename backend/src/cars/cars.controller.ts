import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { CarStatus } from './entities/car.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('cars')
@Controller('cars')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CarsController {
  constructor(private readonly carsService: CarsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new car' })
  @ApiResponse({ status: 201, description: 'Car created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(@CurrentUser() user: any, @Body() createCarDto: CreateCarDto) {
    return this.carsService.create(createCarDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all cars (optionally filtered by user or status)' })
  @ApiQuery({ name: 'userId', required: false, description: 'Filter by user ID' })
  @ApiQuery({ name: 'status', required: false, enum: CarStatus, description: 'Filter by status' })
  @ApiResponse({ status: 200, description: 'Cars retrieved successfully' })
  async findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: CarStatus,
  ) {
    if (status) {
      return this.carsService.findByStatus(status, userId);
    }
    return this.carsService.findAll(userId);
  }

  @Get('my-cars')
  @ApiOperation({ summary: 'Get all cars owned by current user' })
  @ApiResponse({ status: 200, description: 'User cars retrieved successfully' })
  async findMyCars(@CurrentUser() user: any) {
    return this.carsService.findByUser(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a car by ID' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Car retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    // Allow users to view any car, but if they want to edit/delete, ownership is checked
    return this.carsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update car details' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Car updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCarDto: UpdateCarDto,
  ) {
    return this.carsService.update(id, updateCarDto, user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a car (soft delete)' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({ status: 204, description: 'Car deleted successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    await this.carsService.remove(id, user.userId);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update car status' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Car status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateStatusDto: UpdateStatusDto,
  ) {
    return this.carsService.updateStatus(id, updateStatusDto, user.userId);
  }

  @Get(':id/steps/status')
  @ApiOperation({ summary: 'Get step completion status' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Step status retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async getStepCompletionStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.carsService.getStepCompletionStatus(id, user.userId);
  }

  @Get(':id/submission-summary')
  @ApiOperation({ summary: 'Get full submission summary (car details + media)' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Submission summary retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async getSubmissionSummary(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.carsService.getSubmissionSummary(id, user.userId);
  }

  @Post(':id/lock-and-submit')
  @ApiOperation({ summary: 'Lock car data and submit for AI analysis' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({ status: 200, description: 'Car locked and submitted for analysis successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async lockAndSubmitForAnalysis(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { reportId?: string },
  ) {
    return this.carsService.lockAndSubmitForAnalysis(id, user.userId, body.reportId);
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit car for AI analysis (validates, locks, and creates job)' })
  @ApiParam({ name: 'id', description: 'Car ID' })
  @ApiResponse({
    status: 200,
    description: 'Car submitted successfully, AI job created',
    schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        status: { type: 'string', example: 'PENDING' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid car state or missing required media' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async submit(@Param('id') id: string, @CurrentUser() user: any) {
    return this.carsService.submitForAnalysis(id, user.userId);
  }

  @Post('submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit car for AI analysis (validates, locks, and creates job) - v1 endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Car submitted successfully, AI job created',
    schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        status: { type: 'string', example: 'PENDING' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid car state or missing required media' })
  @ApiResponse({ status: 403, description: 'Forbidden - not the car owner' })
  @ApiResponse({ status: 404, description: 'Car not found' })
  async submitV1(@Body() body: { carId: string }, @CurrentUser() user: any) {
    return this.carsService.submitForAnalysis(body.carId, user.userId);
  }
}
