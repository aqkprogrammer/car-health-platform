import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  sellerId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  listingId?: string;
}
