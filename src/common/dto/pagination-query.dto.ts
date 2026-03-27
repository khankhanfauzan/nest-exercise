import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationQueryDto {
    @ApiPropertyOptional({
        example: 1,
        minimum: 1,
        description: 'Page, starting from 1',
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    page?: number;

    @ApiPropertyOptional({
        example: 10,
        minimum: 1,
        maximum: 50,
        description: 'Number of items per page',
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Type(() => Number)
    limit?: number;
}
