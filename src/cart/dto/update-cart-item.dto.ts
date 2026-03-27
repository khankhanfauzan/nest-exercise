import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCartItemDto {
    @ApiProperty({ example: '1', description: 'User ID' })
    @IsString()
    @IsNotEmpty()
    userId: string;

    @ApiProperty({ example: 3, minimum: 1, description: 'Quantity' })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    quantity: number;
}
