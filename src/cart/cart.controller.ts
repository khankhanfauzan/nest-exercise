import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { ApiBadRequestResponse, ApiBody, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiSecurity, ApiTags, ApiTooManyRequestsResponse, ApiUnauthorizedResponse, ApiCreatedResponse } from '@nestjs/swagger';

@ApiTags('cart')
@ApiSecurity('x-api-key')
@ApiUnauthorizedResponse({
  description: 'Unauthorized (missing/invalid API key)',
  schema: { type: 'object', properties: { status: { type: 'number', example: 401 }, message: { type: 'string', example: 'Unauthorized' }, data: { type: 'null', nullable: true } } },
})
@ApiTooManyRequestsResponse({
  description: 'Rate limit exceeded',
  schema: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      error: { type: 'object', properties: { statusCode: { type: 'number', example: 429 }, message: { type: 'string', example: 'Too Many Requests' } } },
      meta: { type: 'object', properties: { limit: { type: 'number', example: 30 }, windowMs: { type: 'number', example: 60000 }, resetAt: { type: 'number', example: 1712345678901 } } },
    },
  },
})
@Controller({ path: 'cart', version: '1' })
export class CartController {
  constructor(private cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get cart by user' })
  @ApiQuery({ name: 'userId', required: true, schema: { type: 'string' } })
  @ApiOkResponse({
    description: 'Current cart',
    headers: { 'X-RateLimit-Limit': { schema: { type: 'string', example: '30' } }, 'X-RateLimit-Remaining': { schema: { type: 'string', example: '29' } }, 'X-RateLimit-Reset': { schema: { type: 'string', example: '1712345678901' } } },
  })
  getCart(@Query('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiBody({ type: AddCartItemDto })
  @ApiCreatedResponse({
    description: 'Item added',
    headers: { 'X-RateLimit-Limit': { schema: { type: 'string', example: '30' } }, 'X-RateLimit-Remaining': { schema: { type: 'string', example: '29' } }, 'X-RateLimit-Reset': { schema: { type: 'string', example: '1712345678901' } } },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: { type: 'object', properties: { status: { type: 'number', example: 400 }, message: { type: 'string', example: 'userId must be a string' }, data: { type: 'null', nullable: true } } },
  })
  addItem(@Body() dto: AddCartItemDto) {
    return this.cartService.addItem(dto.userId, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'productId', example: '2', description: 'Product ID' })
  @ApiBody({ type: UpdateCartItemDto })
  @ApiOkResponse({
    description: 'Item updated',
  })
  updateItem(@Param('productId') productId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItemQuantity(dto.userId, productId, dto.quantity);
  }

  @Delete('items/:productId')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'productId', example: '2', description: 'Product ID' })
  @ApiQuery({ name: 'userId', required: true, schema: { type: 'string' } })
  @ApiOkResponse({
    description: 'Item removed',
  })
  removeItem(@Param('productId') productId: string, @Query('userId') userId: string) {
    return this.cartService.removeItem(userId, productId);
  }
}
