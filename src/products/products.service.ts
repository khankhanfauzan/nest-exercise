import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from 'src/types/product.type';
import { ApiResponse } from 'src/types/api-response.interface';
import { ProductsRepository } from './products.repository';

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository) {}

  create(createProductDto: CreateProductDto) {
    const newProduct: Product = {
      id: (this.productsRepository.findAll().length + 1).toString(),
      ...createProductDto,
    };
    const product = this.productsRepository.create(newProduct);
    return {
      status: 201,
      message: 'Product created',
      data: product,
    };
  }

  findAll(): ApiResponse<Product[]> {
    const products = this.productsRepository.findAll();
    return {
      status: 200,
      message: 'List of all products',
      data: products,
    };
  }

  findOne(id: string): ApiResponse<Product> {
    const product = this.productsRepository.findOne(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'Product found',
      data: product,
    };
  }

  update(id: string, updateProductDto: UpdateProductDto): ApiResponse<Product> {
    const product = this.productsRepository.update(id, updateProductDto);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'Product updated',
      data: product,
    };
  }

  remove(id: string): ApiResponse<null> {
    const deleted = this.productsRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'Product deleted',
    };
  }
}
