import { Injectable } from '@nestjs/common';
import { Order } from 'src/types/order.type';

@Injectable()
export class OrdersRepository {
  private orders: Order[] = [];

  create(order: Order): Order {
    this.orders.push(order);
    return order;
  }

  findAllByUser(userId: string): Order[] {
    return this.orders.filter((o) => o.userId === userId);
  }
}
