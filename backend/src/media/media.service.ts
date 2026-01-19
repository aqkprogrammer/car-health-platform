import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media, MediaType, PhotoType } from './entities/media.entity';
import { RequestUploadDto } from './dto/request-upload.dto';
import { RegisterMediaDto } from './dto/register-media.dto';
import { CarsService } from '../cars/cars.service';
import { CarStatus } from '../cars/entities/car.entity';
import { UpdateStatusDto } from '../cars/dto/update-status.dto';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  private readonly MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4'];
  private readonly REQUIRED_PHOTO_TYPES = [
    PhotoType.FRONT,
    PhotoType.REAR,
    PhotoType.LEFT,
    PhotoType.RIGHT,
    PhotoType.INTERIOR,
    PhotoType.ENGINE_BAY,
  ];

  private s3Client: S3Client;
  private storageType: 'local' | 's3';
  private uploadsDir: string;
  private baseUrl: string;

  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
    @Inject(forwardRef(() => CarsService))
    private carsService: CarsService,
    private configService: ConfigService,
  ) {
    // Determine storage type (default to 'local' if no AWS credentials)
    const accessKeyId = this.configService.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get('AWS_SECRET_ACCESS_KEY');
    const storageTypeConfig = this.configService.get('STORAGE_TYPE') || 'local';
    
    this.storageType = (accessKeyId && secretAccessKey && storageTypeConfig === 's3') ? 's3' : 'local';

    if (this.storageType === 's3') {
      // Initialize S3 client
      const region = this.configService.get('AWS_REGION') || 'us-east-1';
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
    } else {
      // Setup local storage
      const port = this.configService.get('PORT') || 3001;
      const apiPrefix = this.configService.get('API_PREFIX') || 'api';
      this.baseUrl = `http://localhost:${port}/${apiPrefix}/media`;
      this.uploadsDir = path.join(process.cwd(), 'uploads');
      
      // Create uploads directory if it doesn't exist
      if (!fs.existsSync(this.uploadsDir)) {
        fs.mkdirSync(this.uploadsDir, { recursive: true });
      }
    }
  }

  /**
   * Request upload authorization (presigned URL)
   */
  async requestUploadAuthorization(
    carId: string,
    requestUploadDto: RequestUploadDto,
    userId: string,
  ): Promise<{ mediaId: string; uploadUrl: string; expiresIn: number }> {
    // Verify car ownership
    const car = await this.carsService.findOne(carId, userId);
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to upload media for this car');
    }

    // Prevent media uploads if car is submitted, analyzing, or report_ready
    if ([CarStatus.SUBMITTED, CarStatus.ANALYZING, CarStatus.REPORT_READY].includes(car.status)) {
      throw new BadRequestException(
        `Cannot upload media. Car is in ${car.status} status and has been locked for analysis.`,
      );
    }

    // Validate file type and size
    this.validateFileTypeAndSize(requestUploadDto.type, requestUploadDto.mimeType, requestUploadDto.fileSize);

    // Validate photo type for photos
    if (requestUploadDto.type === MediaType.PHOTO && !requestUploadDto.photoType) {
      throw new BadRequestException('photoType is required for photo uploads');
    }

    // Generate unique file name
    const fileExtension = requestUploadDto.fileName.split('.').pop();
    const uniqueFileName = `${crypto.randomUUID()}.${fileExtension}`;
    const storageKey = `cars/${carId}/${requestUploadDto.type}s/${uniqueFileName}`;

    // Create media record (not uploaded yet)
    const media = this.mediaRepository.create({
      carId,
      type: requestUploadDto.type,
      photoType: requestUploadDto.photoType,
      fileName: uniqueFileName,
      originalFileName: requestUploadDto.fileName,
      mimeType: requestUploadDto.mimeType,
      fileSize: requestUploadDto.fileSize,
      storageKey,
      storageUrl: '', // Will be updated after upload
      width: requestUploadDto.width,
      height: requestUploadDto.height,
      duration: requestUploadDto.duration,
      isUploaded: false,
    });

    const savedMedia = await this.mediaRepository.save(media);

    // Generate upload URL based on storage type
    let uploadUrl: string;
    if (this.storageType === 's3') {
      uploadUrl = await this.generatePresignedUrl(storageKey, requestUploadDto.mimeType, requestUploadDto.fileSize);
    } else {
      // For local storage, return the backend proxy endpoint URL
      uploadUrl = `${this.baseUrl}/upload/${savedMedia.id}`;
    }

    return {
      mediaId: savedMedia.id,
      uploadUrl,
      expiresIn: 3600, // 1 hour
    };
  }

  /**
   * Register media after upload
   */
  async registerMedia(
    carId: string,
    mediaId: string,
    registerMediaDto: RegisterMediaDto,
    userId: string,
  ): Promise<Media> {
    // Verify car ownership
    const car = await this.carsService.findOne(carId, userId);
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to register media for this car');
    }

    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, carId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Update media with storage information
    media.storageKey = registerMediaDto.storageKey;
    media.storageUrl = registerMediaDto.storageUrl;
    media.thumbnailUrl = registerMediaDto.thumbnailUrl;
    media.isUploaded = true;
    if (registerMediaDto.metadata) {
      media.metadata = registerMediaDto.metadata;
    }

    const savedMedia = await this.mediaRepository.save(media);

    // Check if all required media is present and update car status
    await this.checkAndUpdateCarStatus(carId);

    return savedMedia;
  }

  /**
   * Get all media for a car
   */
  async getMediaByCar(carId: string, userId?: string): Promise<Media[]> {
    // If userId provided, verify ownership
    if (userId) {
      const car = await this.carsService.findOne(carId, userId);
      if (car.userId !== userId) {
        throw new ForbiddenException('You do not have permission to view media for this car');
      }
    }

    return this.mediaRepository.find({
      where: { carId, deletedAt: null },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get required media checklist
   */
  async getRequiredMediaChecklist(carId: string, userId: string): Promise<{
    requiredPhotos: Array<{ type: PhotoType; label: string; description: string; isRequired: boolean }>;
    requiredVideo: { isRequired: boolean; description: string };
    guidance: {
      photoTips: string[];
      videoTips: string[];
    };
  }> {
    const car = await this.carsService.findOne(carId, userId);
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access checklist for this car');
    }

    const photoLabels: Record<PhotoType, string> = {
      [PhotoType.FRONT]: 'Front View',
      [PhotoType.REAR]: 'Rear View',
      [PhotoType.LEFT]: 'Left Side',
      [PhotoType.RIGHT]: 'Right Side',
      [PhotoType.INTERIOR]: 'Interior',
      [PhotoType.ENGINE_BAY]: 'Engine Bay',
    };

    const photoDescriptions: Record<PhotoType, string> = {
      [PhotoType.FRONT]: 'Stand directly in front of the car, ensure entire front bumper and grille are visible',
      [PhotoType.REAR]: 'Stand directly behind the car, capture entire rear bumper and tail lights',
      [PhotoType.LEFT]: 'Stand parallel to the left side, capture entire side profile with both wheels',
      [PhotoType.RIGHT]: 'Stand parallel to the right side, capture entire side profile with both wheels',
      [PhotoType.INTERIOR]: 'Open all doors for better lighting, capture dashboard, seats, and steering wheel',
      [PhotoType.ENGINE_BAY]: 'Open the hood completely, ensure good lighting, capture entire engine area',
    };

    const requiredPhotos = this.REQUIRED_PHOTO_TYPES.map((type) => ({
      type,
      label: photoLabels[type],
      description: photoDescriptions[type],
      isRequired: true,
    }));

    return {
      requiredPhotos,
      requiredVideo: {
        isRequired: false, // Video is optional but recommended
        description: 'Record engine sound for 10-20 seconds with hood open to help assess vehicle condition',
      },
      guidance: {
        photoTips: [
          'Take photos in good lighting conditions',
          'Ensure photos are clear and not blurry',
          'Include all required angles',
          'Remove any obstructions from view',
        ],
        videoTips: [
          'Record with the hood open',
          'Capture engine sound clearly',
          'Keep video duration between 10-20 seconds',
          'Ensure good audio quality',
        ],
      },
    };
  }

  /**
   * Validate required media presence with warnings
   */
  async validateRequiredMedia(carId: string, userId: string): Promise<{
    isValid: boolean;
    missingPhotos: PhotoType[];
    hasVideo: boolean;
    warnings: string[];
    completionPercentage: number;
  }> {
    const car = await this.carsService.findOne(carId, userId);
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to validate media for this car');
    }

    const media = await this.getMediaByCar(carId, userId);
    const uploadedPhotos = media
      .filter((m) => m.type === MediaType.PHOTO && m.isUploaded)
      .map((m) => m.photoType)
      .filter((pt): pt is PhotoType => pt !== null);

    const missingPhotos = this.REQUIRED_PHOTO_TYPES.filter(
      (pt) => !uploadedPhotos.includes(pt),
    );

    const hasVideo = media.some((m) => m.type === MediaType.VIDEO && m.isUploaded);

    const warnings: string[] = [];
    
    if (missingPhotos.length > 0) {
      const photoLabels: Record<PhotoType, string> = {
        [PhotoType.FRONT]: 'Front View',
        [PhotoType.REAR]: 'Rear View',
        [PhotoType.LEFT]: 'Left Side',
        [PhotoType.RIGHT]: 'Right Side',
        [PhotoType.INTERIOR]: 'Interior',
        [PhotoType.ENGINE_BAY]: 'Engine Bay',
      };
      warnings.push(`Missing required photos: ${missingPhotos.map(p => photoLabels[p]).join(', ')}`);
    }

    if (!hasVideo) {
      warnings.push('Engine sound video is recommended for a more accurate health report');
    }

    if (uploadedPhotos.length === 0) {
      warnings.push('At least one photo is required to proceed');
    }

    const totalRequired = this.REQUIRED_PHOTO_TYPES.length + 1; // 6 photos + 1 video (optional)
    const completed = uploadedPhotos.length + (hasVideo ? 1 : 0);
    const completionPercentage = Math.round((completed / totalRequired) * 100);

    return {
      isValid: missingPhotos.length === 0 && uploadedPhotos.length > 0,
      missingPhotos,
      hasVideo,
      warnings,
      completionPercentage,
    };
  }

  /**
   * Delete media
   */
  async deleteMedia(carId: string, mediaId: string, userId: string): Promise<void> {
    const car = await this.carsService.findOne(carId, userId);
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to delete media for this car');
    }

    // Prevent media deletion if car is submitted, analyzing, or report_ready
    if ([CarStatus.SUBMITTED, CarStatus.ANALYZING, CarStatus.REPORT_READY].includes(car.status)) {
      throw new BadRequestException(
        `Cannot delete media. Car is in ${car.status} status and has been locked for analysis.`,
      );
    }

    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, carId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    // Soft delete
    await this.mediaRepository.softRemove(media);

    // TODO: Delete from storage (S3) as well
  }

  /**
   * Replace media (delete old and request new upload)
   */
  async replaceMedia(
    carId: string,
    mediaId: string,
    requestUploadDto: RequestUploadDto,
    userId: string,
  ): Promise<{ mediaId: string; uploadUrl: string; expiresIn: number }> {
    // Delete old media
    await this.deleteMedia(carId, mediaId, userId);

    // Request new upload
    return this.requestUploadAuthorization(carId, requestUploadDto, userId);
  }

  /**
   * Validate file type and size
   */
  private validateFileTypeAndSize(type: MediaType, mimeType: string, fileSize: number): void {
    if (type === MediaType.PHOTO) {
      if (!this.ALLOWED_PHOTO_TYPES.includes(mimeType)) {
        throw new BadRequestException(
          `Invalid photo type. Allowed types: ${this.ALLOWED_PHOTO_TYPES.join(', ')}`,
        );
      }
      if (fileSize > this.MAX_PHOTO_SIZE) {
        throw new BadRequestException(
          `Photo size exceeds maximum allowed size of ${this.MAX_PHOTO_SIZE / (1024 * 1024)}MB`,
        );
      }
    } else if (type === MediaType.VIDEO) {
      if (!this.ALLOWED_VIDEO_TYPES.includes(mimeType)) {
        throw new BadRequestException(
          `Invalid video type. Allowed types: ${this.ALLOWED_VIDEO_TYPES.join(', ')}`,
        );
      }
      if (fileSize > this.MAX_VIDEO_SIZE) {
        throw new BadRequestException(
          `Video size exceeds maximum allowed size of ${this.MAX_VIDEO_SIZE / (1024 * 1024)}MB`,
        );
      }
    }
  }

  /**
   * Upload file (supports both local and S3 storage)
   */
  async uploadFile(
    carId: string,
    mediaId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ storageKey: string; storageUrl: string }> {
    // Verify car ownership
    const car = await this.carsService.findOne(carId, userId);
    if (car.userId !== userId) {
      throw new ForbiddenException('You do not have permission to upload media for this car');
    }

    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, carId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    if (this.storageType === 's3') {
      return this.uploadFileToS3(carId, mediaId, file, userId);
    } else {
      return this.uploadFileLocally(carId, mediaId, file, userId);
    }
  }

  /**
   * Upload file to local storage
   */
  private async uploadFileLocally(
    carId: string,
    mediaId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ storageKey: string; storageUrl: string }> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, carId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    try {
      // Create car-specific directory
      const carDir = path.join(this.uploadsDir, carId);
      if (!fs.existsSync(carDir)) {
        fs.mkdirSync(carDir, { recursive: true });
      }

      // Create type-specific directory (photos or videos)
      const typeDir = path.join(carDir, `${media.type}s`);
      if (!fs.existsSync(typeDir)) {
        fs.mkdirSync(typeDir, { recursive: true });
      }

      // Save file
      const filePath = path.join(typeDir, media.fileName);
      fs.writeFileSync(filePath, file.buffer);

      // Construct the public URL - endpoint is /cars/:carId/media/files/:carId/:type/:fileName
      const apiPrefix = this.configService.get('API_PREFIX') || 'api';
      const port = this.configService.get('PORT') || 3001;
      const baseUrl = `http://localhost:${port}/${apiPrefix}`;
      const storageUrl = `${baseUrl}/cars/${carId}/media/files/${carId}/${media.type}s/${media.fileName}`;

      // Update media record
      media.storageUrl = storageUrl;
      media.storageKey = `uploads/${carId}/${media.type}s/${media.fileName}`;
      media.isUploaded = true;
      await this.mediaRepository.save(media);

      // Check if all required media is present and update car status
      await this.checkAndUpdateCarStatus(carId);

      return {
        storageKey: media.storageKey,
        storageUrl,
      };
    } catch (error) {
      console.error('Failed to upload file locally:', error);
      throw new BadRequestException(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload file directly to S3 (server-side proxy to bypass CORS)
   */
  private async uploadFileToS3(
    carId: string,
    mediaId: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ storageKey: string; storageUrl: string }> {
    const media = await this.mediaRepository.findOne({
      where: { id: mediaId, carId },
    });

    if (!media) {
      throw new NotFoundException('Media not found');
    }

    const bucket = this.configService.get('AWS_S3_BUCKET') || 'car-health-media';
    const region = this.configService.get('AWS_REGION') || 'us-east-1';

    try {
      // Convert buffer to stream
      const fileStream = Readable.from(file.buffer);

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: media.storageKey,
        Body: fileStream,
        ContentType: file.mimetype,
        Metadata: {
          'original-size': file.size.toString(),
          'original-filename': file.originalname,
        },
      });

      await this.s3Client.send(command);

      // Construct the public URL
      const storageUrl = `https://${bucket}.s3.${region}.amazonaws.com/${media.storageKey}`;

      // Update media record
      media.storageUrl = storageUrl;
      media.isUploaded = true;
      await this.mediaRepository.save(media);

      // Check if all required media is present and update car status
      await this.checkAndUpdateCarStatus(carId);

      return {
        storageKey: media.storageKey,
        storageUrl,
      };
    } catch (error) {
      console.error('Failed to upload file to S3:', error);
      throw new BadRequestException(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for S3 upload
   */
  private async generatePresignedUrl(storageKey: string, mimeType: string, fileSize: number): Promise<string> {
    const bucket = this.configService.get('AWS_S3_BUCKET') || 'car-health-media';
    const expiresIn = 3600; // 1 hour

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        ContentType: mimeType,
        // Add CORS headers to allow browser uploads
        Metadata: {
          'original-size': fileSize.toString(),
        },
      });

      // Generate presigned URL
      const presignedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });

      return presignedUrl;
    } catch (error) {
      // Fallback to mock URL if AWS credentials are not configured (for development)
      console.warn('Failed to generate presigned URL, using mock URL:', error.message);
      const region = this.configService.get('AWS_REGION') || 'us-east-1';
      return `https://${bucket}.s3.${region}.amazonaws.com/${storageKey}?presigned=true&expires=3600`;
    }
  }

  /**
   * Serve local file (public endpoint - no auth required)
   */
  async serveLocalFile(carId: string, type: string, fileName: string, userId?: string): Promise<any> {
    // Verify file exists and belongs to the car (security check)
    const media = await this.mediaRepository.findOne({
      where: { carId, fileName, deletedAt: null },
    });

    if (!media) {
      throw new NotFoundException('File not found');
    }

    // Verify file is uploaded
    if (!media.isUploaded) {
      throw new NotFoundException('File not uploaded yet');
    }

    // If userId provided, verify ownership (optional - for additional security)
    if (userId) {
      const car = await this.carsService.findOne(carId, userId);
      if (car.userId !== userId) {
        throw new ForbiddenException('You do not have permission to access this file');
      }
    }

    // Handle both singular and plural types (photo/photos, video/videos)
    const normalizedType = type.endsWith('s') ? type : `${type}s`;
    const filePath = path.join(this.uploadsDir, carId, normalizedType, fileName);
    
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File not found on disk');
    }

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = media.mimeType || 'application/octet-stream';

    return {
      file: fileBuffer,
      mimeType,
      fileName: media.originalFileName || fileName,
    };
  }

  /**
   * Check if all required media is present and update car status
   */
  private async checkAndUpdateCarStatus(carId: string): Promise<void> {
    try {
      const car = await this.carsService.findOne(carId);
      const validation = await this.validateRequiredMedia(carId, car.userId);
      
      if (validation.isValid && car.status === CarStatus.DRAFT) {
        // Update car status to media_uploaded if all required photos are present
        const updateStatusDto: UpdateStatusDto = { status: CarStatus.MEDIA_UPLOADED };
        await this.carsService.updateStatus(
          carId,
          updateStatusDto,
          car.userId,
        );
      }
    } catch (error) {
      // Silently fail - status update is not critical
      console.error('Error updating car status:', error);
    }
  }
}
