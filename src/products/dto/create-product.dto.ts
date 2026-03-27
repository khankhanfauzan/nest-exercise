import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

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

    @ApiPropertyOptional({
        type: [String],
        example: ['1', '2'],
        description: 'Category IDs',
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categoryIds?: string[];
}
