import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepository } from './cart.repository';
import { ProductsModule } from 'src/products/products.module';
import { OrdersModule } from 'src/orders/orders.module';
import { CheckoutController } from './checkout.controller';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [CartController, CheckoutController],
  providers: [CartService, CartRepository],
})
export class CartModule {}
