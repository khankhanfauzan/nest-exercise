import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ConfirmCheckoutDto {
  @ApiProperty({ example: '1', description: 'User ID' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ example: 'Please process it immediately ', description: 'Notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
