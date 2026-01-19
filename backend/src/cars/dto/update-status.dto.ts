import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CarStatus } from '../entities/car.entity';

export class UpdateStatusDto {
  @ApiProperty({ enum: CarStatus, example: CarStatus.MEDIA_UPLOADED })
  @IsEnum(CarStatus)
  @IsNotEmpty()
  status: CarStatus;

  @ApiProperty({ required: false, description: 'Optional note about the status change' })
  @IsString()
  @IsOptional()
  note?: string;
}
