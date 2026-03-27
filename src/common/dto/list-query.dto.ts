import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from './pagination-query.dto';

export class ListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ example: 'laptop', description: 'Search keywords' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'name', description: 'Field for sorting' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'asc', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
