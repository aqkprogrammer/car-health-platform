import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Car, CarStatus } from './entities/car.entity';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { MediaService } from '../media/media.service';
import { AIJobsService } from '../ai-jobs/ai-jobs.service';
import { AIJob } from '../ai-jobs/entities/ai-job.entity';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car)
    private carsRepository: Repository<Car>,
    @Inject(forwardRef(() => MediaService))
    private mediaService: MediaService,
    private aiJobsService: AIJobsService,
  ) {}

  async create(createCarDto: CreateCarDto, userId: string): Promise<Car> {
    const car = this.carsRepository.create({
      ...createCarDto,
      userId,
      ownershipCount: createCarDto.ownershipCount || 1,
      status: createCarDto.status || CarStatus.DRAFT,
    });
    return this.carsRepository.save(car);
  }

  async findAll(userId?: string): Promise<Car[]> {
    const where: any = { deletedAt: null };
    if (userId) {
      where.userId = userId;
    }
    return this.carsRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId?: string): Promise<Car> {
    const where: any = { id, deletedAt: null };
    if (userId) {
      where.userId = userId;
    }

    const car = await this.carsRepository.findOne({
      where,
      relations: ['user'],
    });

    if (!car) {
      throw new NotFoundException('Car not found');
    }

    return car;
  }

  async findByUser(userId: string): Promise<Car[]> {
    return this.carsRepository.find({
      where: { userId, deletedAt: null },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateCarDto: UpdateCarDto, userId: string): Promise<Car> {
    const car = await this.findOne(id, userId);

    // Check ownership
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this car');
    }

    // Prevent edits if car is submitted, analyzing, or report_ready
    if ([CarStatus.SUBMITTED, CarStatus.ANALYZING, CarStatus.REPORT_READY].includes(car.status)) {
      throw new BadRequestException(
        `Cannot edit car data. Car is in ${car.status} status and has been locked for analysis.`,
      );
    }

    Object.assign(car, updateCarDto);
    return this.carsRepository.save(car);
  }

  async remove(id: string, userId: string): Promise<void> {
    const car = await this.findOne(id, userId);

    // Check ownership
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete this car');
    }

    // Soft delete
    await this.carsRepository.softRemove(car);
  }

  /**
   * Update car status with validation
   */
  async updateStatus(id: string, updateStatusDto: UpdateStatusDto, userId: string): Promise<Car> {
    const car = await this.findOne(id, userId);

    // Check ownership
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to update this car status');
    }

    // Validate status transition
    this.validateStatusTransition(car.status, updateStatusDto.status);

    car.status = updateStatusDto.status;
    
    // Update additionalDetails with status change note if provided
    if (updateStatusDto.note) {
      car.additionalDetails = {
        ...car.additionalDetails,
        statusChangeNote: updateStatusDto.note,
        statusChangedAt: new Date().toISOString(),
      };
    }

    return this.carsRepository.save(car);
  }

  /**
   * Validate status transitions
   * Allowed transitions:
   * - draft -> media_uploaded -> submitted -> analyzing -> report_ready
   * - Can go back to previous states (except from report_ready)
   */
  private validateStatusTransition(currentStatus: CarStatus, newStatus: CarStatus): void {
    const validTransitions: Record<CarStatus, CarStatus[]> = {
      [CarStatus.DRAFT]: [CarStatus.MEDIA_UPLOADED, CarStatus.DRAFT],
      [CarStatus.MEDIA_UPLOADED]: [CarStatus.DRAFT, CarStatus.SUBMITTED, CarStatus.MEDIA_UPLOADED],
      [CarStatus.SUBMITTED]: [CarStatus.MEDIA_UPLOADED, CarStatus.ANALYZING, CarStatus.SUBMITTED],
      [CarStatus.ANALYZING]: [CarStatus.SUBMITTED, CarStatus.REPORT_READY, CarStatus.ANALYZING],
      [CarStatus.REPORT_READY]: [CarStatus.REPORT_READY], // Final state, can't go back
    };

    const allowedStatuses = validTransitions[currentStatus] || [];
    
    if (!allowedStatuses.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}. ` +
        `Allowed transitions: ${allowedStatuses.join(', ')}`,
      );
    }
  }

  /**
   * Get cars by status
   */
  async findByStatus(status: CarStatus, userId?: string): Promise<Car[]> {
    const where: any = { status, deletedAt: null };
    if (userId) {
      where.userId = userId;
    }
    return this.carsRepository.find({
      where,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get full submission summary (car details + media)
   */
  async getSubmissionSummary(carId: string, userId: string): Promise<{
    car: Car;
    media: any[];
    canEdit: boolean;
    isLocked: boolean;
  }> {
    const car = await this.findOne(carId, userId);

    // Check ownership
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access submission summary for this car');
    }

    // Get media for this car
    const media = await this.mediaService.getMediaByCar(carId, userId);

    // Check if car is locked
    // Locked: SUBMITTED, ANALYZING, REPORT_READY
    // Editable: DRAFT, MEDIA_UPLOADED (user can edit before submitting or after failure)
    const isLocked = [CarStatus.SUBMITTED, CarStatus.ANALYZING, CarStatus.REPORT_READY].includes(car.status);
    const canEdit = !isLocked; // Can edit when status is DRAFT or MEDIA_UPLOADED

    return {
      car,
      media,
      canEdit,
      isLocked,
    };
  }

  /**
   * Lock car data and update status to analyzing
   */
  async lockAndSubmitForAnalysis(carId: string, userId: string, reportId?: string): Promise<Car> {
    const car = await this.findOne(carId, userId);

    // Check ownership
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to submit this car for analysis');
    }

    // Validate current status - must be draft, media_uploaded, or submitted
    if (![CarStatus.DRAFT, CarStatus.MEDIA_UPLOADED, CarStatus.SUBMITTED].includes(car.status)) {
      throw new BadRequestException(
        `Cannot submit car for analysis. Current status is ${car.status}. ` +
        `Car must be in draft, media_uploaded, or submitted status.`,
      );
    }

    // Update status to analyzing
    car.status = CarStatus.ANALYZING;
    
    // Store submission metadata
    car.additionalDetails = {
      ...car.additionalDetails,
      submittedAt: new Date().toISOString(),
      reportId: reportId || null,
      lockedForAnalysis: true,
    };

    return this.carsRepository.save(car);
  }

  /**
   * Get step completion status for a car
   */
  async getStepCompletionStatus(carId: string, userId: string): Promise<{
    step1Complete: boolean;
    step2Complete: boolean;
    readyForSubmission: boolean;
    step1Details: {
      hasCarDetails: boolean;
      hasRequiredFields: boolean;
      missingFields: string[];
    };
    step2Details: {
      uploadedPhotosCount: number;
      requiredPhotosCount: number;
      hasVideo: boolean;
      missingPhotos: string[];
    };
  }> {
    const car = await this.findOne(carId, userId);
    
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access step status for this car');
    }

    // Step 1: Check if car details are complete
    const requiredFields = ['make', 'model', 'year'];
    const missingFields = requiredFields.filter(field => !car[field as keyof Car]);
    const hasCarDetails = car !== null;
    const hasRequiredFields = missingFields.length === 0;
    const step1Complete = hasCarDetails && hasRequiredFields;

    // Step 2: Check media upload status via media service
    let step2Details = {
      uploadedPhotosCount: 0,
      requiredPhotosCount: 6,
      hasVideo: false,
      missingPhotos: [] as string[],
    };

    try {
      const mediaValidation = await this.mediaService.validateRequiredMedia(carId, userId);
      const photoLabels: Record<string, string> = {
        'front': 'Front View',
        'rear': 'Rear View',
        'left': 'Left Side',
        'right': 'Right Side',
        'interior': 'Interior',
        'engineBay': 'Engine Bay',
      };

      step2Details = {
        uploadedPhotosCount: 6 - mediaValidation.missingPhotos.length,
        requiredPhotosCount: 6,
        hasVideo: mediaValidation.hasVideo,
        missingPhotos: mediaValidation.missingPhotos.map(p => photoLabels[p] || p),
      };
    } catch (error) {
      // If media validation fails, use car status as fallback
      console.warn('Failed to validate media for step status:', error);
    }

    const step2Complete = step2Details.uploadedPhotosCount >= 1; // At least one photo required

    return {
      step1Complete,
      step2Complete,
      readyForSubmission: step1Complete && step2Complete,
      step1Details: {
        hasCarDetails,
        hasRequiredFields,
        missingFields,
      },
      step2Details,
    };
  }

  /**
   * Submit car for AI analysis
   * Validates car, checks required media, locks car, and creates AI job
   */
  async submitForAnalysis(carId: string, userId: string): Promise<{ jobId: string; status: string }> {
    const car = await this.findOne(carId, userId);

    // Check ownership
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to submit this car for analysis');
    }

    // Validate current status - must be draft, media_uploaded, or submitted
    if (![CarStatus.DRAFT, CarStatus.MEDIA_UPLOADED, CarStatus.SUBMITTED].includes(car.status)) {
      throw new BadRequestException(
        `Cannot submit car for analysis. Current status is ${car.status}. ` +
        `Car must be in draft, media_uploaded, or submitted status.`,
      );
    }

    // Validate required media is uploaded
    const mediaValidation = await this.mediaService.validateRequiredMedia(carId, userId);
    if (!mediaValidation.isValid) {
      throw new BadRequestException(
        `Cannot submit car. Missing required media: ${mediaValidation.missingPhotos.join(', ')}. ` +
        `At least one photo is required.`,
      );
    }

    // Lock car and update status to analyzing
    car.status = CarStatus.ANALYZING;
    car.additionalDetails = {
      ...car.additionalDetails,
      submittedAt: new Date().toISOString(),
      lockedForAnalysis: true,
    };
    await this.carsRepository.save(car);

    // Create AI job
    const job = await this.aiJobsService.createJob({ carId });

    return {
      jobId: job.jobId,
      status: job.status,
    };
  }
}
