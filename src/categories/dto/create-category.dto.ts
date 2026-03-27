import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Computers & Laptops', description: 'Nama kategori' })
  @IsString()
  @MinLength(2)
  name: string;
}
