import { Injectable, NotFoundException } from '@nestjs/common';
import { CartRepository } from './cart.repository';
import { Cart, CartItem } from 'src/types/cart.type';
import { ProductsRepository } from 'src/products/products.repository';
import { ApiResponse } from 'src/types/api-response.interface';
import { OrdersRepository } from 'src/orders/orders.repository';
import { Order, OrderItem } from 'src/types/order.type';

@Injectable()
export class CartService {
    constructor(
        private cartRepository: CartRepository,
        private productsRepository: ProductsRepository,
        private ordersRepository: OrdersRepository,
    ) { }

    getCart(userId: string): ApiResponse<Cart> {
        const cart = this.cartRepository.getOrCreate(userId);
        return { status: 200, message: 'Cart fetched', data: cart };
    }

    addItem(userId: string, productId: string, quantity: number): ApiResponse<Cart> {
        const product = this.productsRepository.findOne(productId);
        if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
        }
        const cart = this.cartRepository.getOrCreate(userId);
        const existing = cart.items.find((cartItem) => cartItem.productId === productId);
        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }
        this.cartRepository.save(cart);
        return { status: 200, message: 'Item added to cart', data: cart };
    }

    updateItemQuantity(userId: string, productId: string, quantity: number): ApiResponse<Cart> {
        const cart = this.cartRepository.getOrCreate(userId);
        const existing = cart.items.find((cartItem) => cartItem.productId === productId);
        if (!existing) {
            throw new NotFoundException(`Product with ID ${productId} not found in cart`);
        }
        existing.quantity = quantity;
        this.cartRepository.save(cart);
        return { status: 200, message: 'Cart item updated', data: cart };
    }

    removeItem(userId: string, productId: string): ApiResponse<Cart> {
        const cart = this.cartRepository.getOrCreate(userId);
        const originalItemCount = cart.items.length;
        cart.items = cart.items.filter((cartItem) => cartItem.productId !== productId);
        if (cart.items.length === originalItemCount) {
            throw new NotFoundException(`Product with ID ${productId} not found in cart`);
        }
        this.cartRepository.save(cart);
        return { status: 200, message: 'Cart item removed', data: cart };
    }

    getSummary(userId: string): ApiResponse<{
        items: Array<OrderItem>;
        subtotal: number;
        discount: number;
        tax: number;
        total: number;
    }> {
        const cart = this.cartRepository.getOrCreate(userId);
        const items: OrderItem[] = cart.items.map((item: CartItem) => {
            const product = this.productsRepository.findOne(item.productId);
            if (!product) {
                throw new NotFoundException(`Product with ID ${item.productId} not found`);
            }
            const lineTotal = product.price * item.quantity;
            return { productId: item.productId, quantity: item.quantity, price: product.price, name: product.name, lineTotal };
        });
        const subtotal = items.reduce((subtotalAccumulator, orderItem) => subtotalAccumulator + orderItem.lineTotal, 0);
        const discount = 0;
        const tax = 0;
        const total = subtotal - discount + tax;
        return { status: 200, message: 'Checkout summary', data: { items, subtotal, discount, tax, total } };
    }

    confirmCheckout(userId: string, notes?: string): ApiResponse<Order> {
        const summary = this.getSummary(userId).data!;
        const order: Order = {
            id: (this.ordersRepository.findAllByUser(userId).length + 1).toString(),
            userId,
            items: summary.items,
            subtotal: summary.subtotal,
            discount: summary.discount,
            tax: summary.tax,
            total: summary.total,
            status: 'confirmed',
            notes,
            createdAt: new Date().toISOString(),
        };
        this.ordersRepository.create(order);
        this.cartRepository.clear(userId);
        return { status: 201, message: 'Checkout confirmed', data: order };
    }
}
