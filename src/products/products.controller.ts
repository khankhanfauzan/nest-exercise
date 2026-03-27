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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListQueryDto } from 'src/common/dto/list-query.dto';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiTooManyRequestsResponse,
  ApiParam,
  ApiQuery,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('products')
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
@Controller({ path: 'products', version: '1' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @ApiOperation({ summary: 'Create new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiCreatedResponse({
    description: 'Product successfully created',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'Product created' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Casual shoes' },
            price: { type: 'number', example: 520000 },
            description: {
              type: 'string',
              example: 'Brand new shoes',
              nullable: true,
            },
            categoryIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['2'],
            },
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
        message: {
          type: 'string',
          example: 'name must be a string, price must be a number',
        },
        data: { type: 'null', nullable: true },
      },
    },
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all products' })
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
    schema: { type: 'string', enum: ['name', 'price', 'id'], default: 'name' },
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' },
  })
  @ApiOkResponse({
    description: 'List all products',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'List of all products' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '1' },
              name: { type: 'string', example: 'Casual shoes' },
              price: { type: 'number', example: 520000 },
              description: {
                type: 'string',
                example: 'Brand new shoes',
                nullable: true,
              },
              categoryIds: {
                type: 'array',
                items: { type: 'string' },
                example: ['2'],
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 63 },
            totalPages: { type: 'number', example: 7 },
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
    return this.productsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single product by id' })
  @ApiParam({ name: 'id', example: '1', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Product found' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Casual shoes' },
            price: { type: 'number', example: 520000 },
            description: {
              type: 'string',
              example: 'Brand new shoes',
              nullable: true,
            },
            categoryIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['2'],
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  @ApiParam({ name: 'id', example: '1', description: 'Product ID' })
  @ApiBody({ type: UpdateProductDto })
  @ApiOkResponse({
    description: 'Product updated',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Product updated' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'Casual shoes' },
            price: { type: 'number', example: 520000 },
            description: {
              type: 'string',
              example: 'Brand new shoes',
              nullable: true,
            },
            categoryIds: {
              type: 'array',
              items: { type: 'string' },
              example: ['2'],
            },
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
        message: { type: 'string', example: 'price must be a number' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', example: '1', description: 'Product ID' })
  @ApiOkResponse({
    description: 'Product deleted',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'Product deleted' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'Product with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
