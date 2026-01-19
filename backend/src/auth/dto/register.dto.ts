import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  BUYER = 'buyer',
  SELLER = 'seller',
  DEALER = 'dealer',
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', required: false, description: 'Email (required if no phone)' })
  @ValidateIf((o) => !o.phone)
  @IsEmail({}, { message: 'Email must be valid' })
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'password123', required: false, description: 'Password (required if email provided)' })
  @ValidateIf((o) => o.email)
  @IsString()
  @IsOptional()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;

  @ApiProperty({ example: '+1234567890', required: false, description: 'Phone number (required if no email)' })
  @ValidateIf((o) => !o.email)
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.BUYER, default: UserRole.BUYER, required: false })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
