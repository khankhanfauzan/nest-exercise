import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Casual shoes', description: 'Product name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 520000, description: 'Product price' })
  @IsNumber()
  price: number;

  @ApiProperty({
    example: 'Brand new shoes',
    description: 'Product description',
    required: false,
  })
  @IsOptional()
  description?: string;
}
