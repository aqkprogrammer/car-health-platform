import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAnalysisJobDto {
  @ApiProperty({ description: 'Car ID to analyze' })
  @IsString()
  @IsNotEmpty()
  carId: string;
}
