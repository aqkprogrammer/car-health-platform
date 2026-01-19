import { IsNotEmpty, IsString, IsEnum, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MediaType, PhotoType } from '../entities/media.entity';

export class RequestUploadDto {
  @ApiProperty({ enum: MediaType, example: MediaType.PHOTO })
  @IsEnum(MediaType)
  @IsNotEmpty()
  type: MediaType;

  @ApiProperty({ enum: PhotoType, example: PhotoType.FRONT, required: false })
  @IsEnum(PhotoType)
  @IsOptional()
  photoType?: PhotoType;

  @ApiProperty({ example: 'car-photo-front.jpg' })
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 5242880, description: 'File size in bytes' })
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  @Max(50 * 1024 * 1024) // 50MB max
  fileSize: number;

  @ApiProperty({ example: 1920, required: false, description: 'Image/video width' })
  @IsNumber()
  @IsOptional()
  width?: number;

  @ApiProperty({ example: 1080, required: false, description: 'Image/video height' })
  @IsNumber()
  @IsOptional()
  height?: number;

  @ApiProperty({ example: 15, required: false, description: 'Video duration in seconds' })
  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(20)
  duration?: number;
}
