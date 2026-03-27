import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { ConfirmCheckoutDto } from './dto/confirm-checkout.dto';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiQuery, ApiSecurity, ApiTags, ApiTooManyRequestsResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';

@ApiTags('checkout')
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
@Controller({ path: 'checkout', version: '1' })
export class CheckoutController {
  constructor(private cartService: CartService) { }

  @Get('summary')
  @ApiOperation({ summary: 'Get checkout summary' })
  @ApiQuery({ name: 'userId', required: true, schema: { type: 'string' } })
  @ApiOkResponse({
    description: 'Summary of cart totals',
    headers: { 'X-RateLimit-Limit': { schema: { type: 'string', example: '30' } }, 'X-RateLimit-Remaining': { schema: { type: 'string', example: '29' } }, 'X-RateLimit-Reset': { schema: { type: 'string', example: '1712345678901' } } },
  })
  summary(@Query('userId') userId: string) {
    return this.cartService.getSummary(userId);
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm checkout' })
  @ApiBody({ type: ConfirmCheckoutDto })
  @ApiCreatedResponse({
    description: 'Order created from cart items',
    headers: { 'X-RateLimit-Limit': { schema: { type: 'string', example: '30' } }, 'X-RateLimit-Remaining': { schema: { type: 'string', example: '29' } }, 'X-RateLimit-Reset': { schema: { type: 'string', example: '1712345678901' } } },
  })
  @ApiBadRequestResponse({
    description: 'Validation error',
    schema: { type: 'object', properties: { status: { type: 'number', example: 400 }, message: { type: 'string' }, data: { type: 'null', nullable: true } } },
  })
  confirm(@Body() dto: ConfirmCheckoutDto) {
    return this.cartService.confirmCheckout(dto.userId, dto.notes);
  }
}
