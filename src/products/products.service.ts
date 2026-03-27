import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from 'src/types/product.type';
import { ApiResponse } from 'src/types/api-response.interface';
import { ProductsRepository } from './products.repository';
import { CategoriesRepository } from 'src/categories/categories.repository';
import { ListQuery } from 'src/common/types/list-query.type';

@Injectable()
export class ProductsService {
  constructor(private productsRepository: ProductsRepository, private categoriesRepository: CategoriesRepository) { }

  create(createProductDto: CreateProductDto) {
    if (createProductDto.categoryIds && createProductDto.categoryIds.length > 0) {
      const allCategoryIds = new Set(this.categoriesRepository.findAll().map((c) => c.id));
      const invalidIds = createProductDto.categoryIds.filter((id) => !allCategoryIds.has(id));
      if (invalidIds.length > 0) {
        throw new BadRequestException(`Invalid categoryIds: ${invalidIds.join(', ')}`);
      }
    }
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

  findAll(params?: ListQuery): ApiResponse<Product[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const requestedLimit = Number(params?.limit) || 10;
    const limit = Math.min(Math.max(1, requestedLimit), 50);
    const allProducts = this.productsRepository.findAll();
    const searchKeyword = (params?.search ?? '')
      .toString()
      .trim()
      .toLowerCase();
    const isValidSortField = (
      field: unknown,
    ): field is 'name' | 'price' | 'id' =>
      field === 'name' || field === 'price' || field === 'id';
    const sortBy: 'name' | 'price' | 'id' = isValidSortField(params?.sortBy)
      ? params.sortBy
      : 'id';
    const sortOrder: 'asc' | 'desc' =
      params?.sortOrder === 'desc' ? 'desc' : 'asc';

    const categoriesMap = new Map(
      this.categoriesRepository.findAll().map((c) => [c.id, c.name.toLowerCase()]),
    );
    const filteredProducts = searchKeyword
      ? allProducts.filter((product) => {
        const nameLower = product.name?.toLowerCase() ?? '';
        const descriptionLower = product.description?.toLowerCase() ?? '';
        const categoryTextLower = (product.categoryIds ?? [])
          .map((id) => categoriesMap.get(id) ?? '')
          .join(' ');
        return (
          nameLower.includes(searchKeyword) ||
          descriptionLower.includes(searchKeyword) ||
          categoryTextLower.includes(searchKeyword)
        );
      })
      : allProducts;

    const sortedProducts = filteredProducts
      .slice()
      .sort((productA, productB) => {
        let comparisonResult = 0;
        if (sortBy === 'price') {
          comparisonResult = (productA.price ?? 0) - (productB.price ?? 0);
        } else if (sortBy === 'id') {
          const productAIdNumber = Number(productA.id);
          const productBIdNumber = Number(productB.id);
          if (
            !Number.isNaN(productAIdNumber) &&
            !Number.isNaN(productBIdNumber)
          ) {
            comparisonResult = productAIdNumber - productBIdNumber;
          } else {
            comparisonResult = String(productA.id).localeCompare(
              String(productB.id),
            );
          }
        } else {
          comparisonResult = String(productA.name ?? '').localeCompare(
            String(productB.name ?? ''),
            undefined,
            { sensitivity: 'base' },
          );
        }
        return sortOrder === 'desc' ? -comparisonResult : comparisonResult;
      });

    const total = sortedProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const pagedProducts = sortedProducts.slice(offset, offset + limit);
    return {
      status: 200,
      message: 'List of all products',
      data: pagedProducts,
      meta: { page, limit, total, totalPages },
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
    if (updateProductDto.categoryIds && updateProductDto.categoryIds.length > 0) {
      const allCategoryIds = new Set(this.categoriesRepository.findAll().map((c) => c.id));
      const invalidIds = updateProductDto.categoryIds.filter((cid) => !allCategoryIds.has(cid));
      if (invalidIds.length > 0) {
        throw new BadRequestException(`Invalid categoryIds: ${invalidIds.join(', ')}`);
      }
    }
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
