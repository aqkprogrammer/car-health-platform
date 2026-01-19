import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FuelType, TransmissionType, CarStatus } from '../entities/car.entity';

export class UpdateCarDto {
  @ApiProperty({ example: 'Toyota', required: false })
  @IsString()
  @IsOptional()
  make?: string;

  @ApiProperty({ example: 'Camry', required: false })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ example: 2020, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year?: number;

  @ApiProperty({ enum: FuelType, required: false })
  @IsEnum(FuelType)
  @IsOptional()
  fuelType?: FuelType;

  @ApiProperty({ enum: TransmissionType, required: false })
  @IsEnum(TransmissionType)
  @IsOptional()
  transmission?: TransmissionType;

  @ApiProperty({ example: 50000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  kilometersDriven?: number;

  @ApiProperty({ example: 1, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  ownershipCount?: number;

  @ApiProperty({ example: 'ABC1234567890XYZ', required: false })
  @IsString()
  @IsOptional()
  vin?: string;

  @ApiProperty({ example: 'MH-01-AB-1234', required: false })
  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @ApiProperty({ example: 'White', required: false })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ example: 'Mumbai', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'Maharashtra', required: false })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiProperty({ example: 'India', required: false })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  additionalDetails?: any;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ enum: CarStatus, required: false })
  @IsEnum(CarStatus)
  @IsOptional()
  status?: CarStatus;
}
