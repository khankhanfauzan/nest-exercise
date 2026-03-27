import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ListQueryDto } from 'src/common/dto/list-query.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

@ApiTags('categories')
@ApiSecurity('x-api-key')
@ApiUnauthorizedResponse({
  description: 'Unauthorized (missing/invalid API key)',
  schema: {
    type: 'object',
    properties: {
      status: { type: 'number', example: 401 },
      message: { type: 'string', example: 'Unauthorized' },
      data: { type: 'null', nullable: true },
    },
  },
})
@ApiTooManyRequestsResponse({
  description: 'Rate limit exceeded',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: {
        type: 'object',
        properties: {
          statusCode: { type: 'number', example: 429 },
          message: { type: 'string', example: 'Too Many Requests' },
        },
      },
      meta: {
        type: 'object',
        properties: {
          limit: { type: 'number', example: 30 },
          windowMs: { type: 'number', example: 60000 },
          resetAt: { type: 'number', example: 1712345678901 },
        },
      },
    },
  },
})
@Controller({ path: 'categories', version: '1' })
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @ApiOperation({ summary: 'Create new category' })
  @ApiBody({ type: CreateCategoryDto })
  @ApiCreatedResponse({
    description: 'Category successfully created',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Category created' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Computers & Laptops' },
          },
        },
      },
    },
    headers: {
      'X-RateLimit-Limit': {
        schema: { type: 'string', example: '30' },
        description: 'Max requests per window',
      },
      'X-RateLimit-Remaining': {
        schema: { type: 'string', example: '29' },
        description: 'Remaining requests in window',
      },
      'X-RateLimit-Reset': {
        schema: { type: 'string', example: '1712345678901' },
        description: 'Reset timestamp (ms epoch)',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: { type: 'string', example: 'name must be a string' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({
    name: 'page',
    required: false,
    schema: { type: 'integer', minimum: 1, default: 1 },
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
  })
  @ApiQuery({ name: 'search', required: false, schema: { type: 'string' } })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    schema: { type: 'string', enum: ['name', 'id'], default: 'name' },
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
  })
  @ApiOkResponse({
    description: 'List all categories',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'List of all categories' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '1' },
              name: { type: 'string', example: 'Computers & Laptops' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 42 },
            totalPages: { type: 'number', example: 5 },
          },
        },
      },
    },
    headers: {
      'X-RateLimit-Limit': { schema: { type: 'string', example: '30' } },
      'X-RateLimit-Remaining': { schema: { type: 'string', example: '29' } },
      'X-RateLimit-Reset': {
        schema: { type: 'string', example: '1712345678901' },
      },
    },
  })
  findAll(@Query() query: ListQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single category by id' })
  @ApiParam({ name: 'id', example: '1', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Category found' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Computers & Laptops' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Category with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: 'Get products by category id' })
  @ApiParam({ name: 'id', example: '2', description: 'Category ID' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } })
  @ApiQuery({ name: 'search', required: false, schema: { type: 'string' } })
  @ApiQuery({ name: 'sortBy', required: false, schema: { type: 'string', enum: ['name', 'price', 'id'], default: 'name' } })
  @ApiQuery({ name: 'sortOrder', required: false, schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } })
  @ApiOkResponse({
    description: 'List of products under the category',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'List of products by category' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '1' },
              name: { type: 'string', example: 'Casual shoes' },
              price: { type: 'number', example: 520000 },
              description: { type: 'string', example: 'Brand new shoes', nullable: true },
              categoryIds: { type: 'array', items: { type: 'string' }, example: ['2'] },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 12 },
            totalPages: { type: 'number', example: 2 },
          },
        },
      },
    },
    headers: {
      'X-RateLimit-Limit': { schema: { type: 'string', example: '30' } },
      'X-RateLimit-Remaining': { schema: { type: 'string', example: '29' } },
      'X-RateLimit-Reset': { schema: { type: 'string', example: '1712345678901' } },
    },
  })
  getProductsByCategory(@Param('id') id: string, @Query() query: ListQueryDto) {
    return this.categoriesService.findProductsByCategory(id, query);
  }
  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  @ApiParam({ name: 'id', example: '1', description: 'Category ID' })
  @ApiBody({ type: UpdateCategoryDto })
  @ApiOkResponse({
    description: 'Category updated',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Category updated' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Computers & Laptops' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: { type: 'string', example: 'name must be a string' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Category with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  @ApiParam({ name: 'id', example: '1', description: 'Category ID' })
  @ApiOkResponse({
    description: 'Category deleted',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Category deleted' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Category not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Category with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
