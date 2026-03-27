import { CartItem } from './cart.type';

export interface OrderItem extends CartItem {
  price: number;
  name: string;
  lineTotal: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: 'confirmed';
  notes?: string;
  createdAt: string;
}
