import { IsNotEmpty, IsString, IsNumber, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  make: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  model: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  year: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  carDetails?: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  media?: any;
}
