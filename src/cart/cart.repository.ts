import { Injectable } from '@nestjs/common';
import { Cart } from 'src/types/cart.type';

@Injectable()
export class CartRepository {
  private carts = new Map<string, Cart>();

  getOrCreate(userId: string): Cart {
    let cart = this.carts.get(userId);
    if (!cart) {
      cart = { userId, items: [] };
      this.carts.set(userId, cart);
    }
    return cart;
  }

  save(cart: Cart): Cart {
    this.carts.set(cart.userId, cart);
    return cart;
  }

  clear(userId: string): void {
    this.carts.set(userId, { userId, items: [] });
  }
}
