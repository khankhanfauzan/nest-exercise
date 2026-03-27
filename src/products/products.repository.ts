import { Injectable } from '@nestjs/common';
import { productsMock } from 'src/data/products.mock';
import { Product } from 'src/types/product.type';

@Injectable()
export class ProductsRepository {
  private products: Product[] = productsMock;

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product | undefined {
    return this.products.find((product) => product.id === id);
  }

  create(product: Product): Product {
    this.products.push(product);
    return product;
  }

  update(id: string, updates: Partial<Product>): Product | undefined {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return undefined;
    this.products[index] = { ...this.products[index], ...updates };
    return this.products[index];
  }

  remove(id: string): boolean {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return false;
    this.products.splice(index, 1);
    return true;
  }
}
