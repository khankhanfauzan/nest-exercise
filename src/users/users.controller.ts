import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
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

@ApiTags('users')
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
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ApiOperation({ summary: 'Create new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User successfully created',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 201 },
        message: { type: 'string', example: 'User created' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@mail.com' },
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
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 400 },
        message: { type: 'string', example: 'email must be an email' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, schema: { type: 'integer', minimum: 1, default: 1 } })
  @ApiQuery({ name: 'limit', required: false, schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 } })
  @ApiQuery({ name: 'search', required: false, schema: { type: 'string' } })
  @ApiQuery({ name: 'sortBy', required: false, schema: { type: 'string', enum: ['name', 'email', 'id'], default: 'name' } })
  @ApiQuery({ name: 'sortOrder', required: false, schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } })
  @ApiOkResponse({
    description: 'List all users',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'List of all users' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '1' },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john@mail.com' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 40 },
            totalPages: { type: 'number', example: 4 },
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
  findAll(@Query() query: ListQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single user by id' })
  @ApiParam({ name: 'id', example: '1', description: 'User ID' })
  @ApiOkResponse({
    description: 'User found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'User found' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@mail.com' },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', example: '1', description: 'User ID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({
    description: 'User updated',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'User updated' },
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '1' },
            name: { type: 'string', example: 'John Doe' },
            email: { type: 'string', example: 'john@mail.com' },
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
        message: { type: 'string', example: 'email must be an email' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', example: '1', description: 'User ID' })
  @ApiOkResponse({
    description: 'User deleted',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 200 },
        message: { type: 'string', example: 'User deleted' },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User with ID 1 not found' },
        data: { type: 'null', nullable: true },
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
