import { IsNotEmpty, IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterMediaDto {
  @ApiProperty({ example: 's3://bucket/cars/car-id/media-id.jpg' })
  @IsString()
  @IsNotEmpty()
  storageKey: string;

  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/...' })
  @IsString()
  @IsNotEmpty()
  storageUrl: string;

  @ApiProperty({ example: 'https://bucket.s3.amazonaws.com/...thumb.jpg', required: false })
  @IsString()
  @IsOptional()
  thumbnailUrl?: string;

  @ApiProperty({ required: false, description: 'Additional metadata' })
  @IsObject()
  @IsOptional()
  metadata?: any;
}
