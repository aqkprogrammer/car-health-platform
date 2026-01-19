import { IsNotEmpty, IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentType {
  REPORT = 'report',
  SUBSCRIPTION = 'subscription',
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  reportId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  currency: string;

  @ApiProperty({ enum: PaymentType })
  @IsEnum(PaymentType)
  type: PaymentType;
}
