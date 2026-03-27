import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoriesRepository } from './categories.repository';
import { ApiResponse } from 'src/types/api-response.interface';
import { Category } from 'src/types/category.type';
import { ListQuery } from 'src/common/types/list-query.type';
import { ProductsRepository } from 'src/products/products.repository';
import { Product } from 'src/types/product.type';

@Injectable()
export class CategoriesService {
  constructor(private categoriesRepository: CategoriesRepository, private productsRepository: ProductsRepository) { }

  create(createCategoryDto: CreateCategoryDto): ApiResponse<Category> {
    const newCategory: Category = {
      id: (this.categoriesRepository.findAll().length + 1).toString(),
      name: createCategoryDto.name,
    };
    const created = this.categoriesRepository.create(newCategory);
    return {
      status: 201,
      message: 'Category created',
      data: created,
    };
  }

  findAll(params?: ListQuery): ApiResponse<Category[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const requestedLimit = Number(params?.limit) || 10;
    const limit = Math.min(Math.max(1, requestedLimit), 50);
    const allCategories = this.categoriesRepository.findAll();
    const searchKeyword = (params?.search ?? '')
      .toString()
      .trim()
      .toLowerCase();
    const isValidSortField = (field: unknown): field is 'name' | 'id' =>
      field === 'name' || field === 'id';
    const sortBy: 'name' | 'id' = isValidSortField(params?.sortBy)
      ? params!.sortBy!
      : 'name';
    const sortOrder: 'asc' | 'desc' =
      params?.sortOrder === 'desc' ? 'desc' : 'asc';

    const filteredCategories = searchKeyword
      ? allCategories.filter((category) => {
        const nameLower = category.name?.toLowerCase() ?? '';
        return nameLower.includes(searchKeyword);
      })
      : allCategories;

    const sortedCategories = filteredCategories
      .slice()
      .sort((categoryA, categoryB) => {
        let comparisonResult = 0;
        if (sortBy === 'id') {
          const categoryAIdNumber = Number(categoryA.id);
          const categoryBIdNumber = Number(categoryB.id);
          if (
            !Number.isNaN(categoryAIdNumber) &&
            !Number.isNaN(categoryBIdNumber)
          ) {
            comparisonResult = categoryAIdNumber - categoryBIdNumber;
          } else {
            comparisonResult = String(categoryA.id).localeCompare(
              String(categoryB.id),
            );
          }
        } else {
          comparisonResult = String(categoryA.name ?? '').localeCompare(
            String(categoryB.name ?? ''),
            undefined,
            { sensitivity: 'base' },
          );
        }
        return sortOrder === 'desc' ? -comparisonResult : comparisonResult;
      });

    const total = sortedCategories.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const pagedCategories = sortedCategories.slice(offset, offset + limit);

    return {
      status: 200,
      message: 'List of all categories',
      data: pagedCategories,
      meta: { page, limit, total, totalPages },
    };
  }

  findOne(id: string): ApiResponse<Category> {
    const category = this.categoriesRepository.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'Category found',
      data: category,
    };
  }

  update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): ApiResponse<Category> {
    const updated = this.categoriesRepository.update(id, updateCategoryDto);
    if (!updated) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'Category updated',
      data: updated,
    };
  }

  remove(id: string): ApiResponse<null> {
    const deleted = this.categoriesRepository.remove(id);
    if (!deleted) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return {
      status: 200,
      message: 'Category deleted',
    };
  }

  findProductsByCategory(
    categoryId: string,
    params?: ListQuery,
  ): ApiResponse<Product[]> {
    const page = Math.max(1, Number(params?.page) || 1);
    const requestedLimit = Number(params?.limit) || 10;
    const limit = Math.min(Math.max(1, requestedLimit), 50);
    const searchKeyword = (params?.search ?? '').toString().trim().toLowerCase();
    const sortOrder: 'asc' | 'desc' = params?.sortOrder === 'desc' ? 'desc' : 'asc';
    const isValidSortField = (field: unknown): field is 'name' | 'price' | 'id' =>
      field === 'name' || field === 'price' || field === 'id';
    const sortBy: 'name' | 'price' | 'id' = isValidSortField(params?.sortBy)
      ? (params!.sortBy! as 'name' | 'price' | 'id')
      : 'name';

    const allProducts = this.productsRepository.findAll().filter((p) =>
      (p.categoryIds ?? []).includes(categoryId),
    );

    const filteredProducts = searchKeyword
      ? allProducts.filter((product) => {
        const nameLower = product.name?.toLowerCase() ?? '';
        const descriptionLower = product.description?.toLowerCase() ?? '';
        return nameLower.includes(searchKeyword) || descriptionLower.includes(searchKeyword);
      })
      : allProducts;

    const sortedProducts = filteredProducts.slice().sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'price') {
        comparison = (a.price ?? 0) - (b.price ?? 0);
      } else if (sortBy === 'id') {
        const aId = Number(a.id);
        const bId = Number(b.id);
        comparison = !Number.isNaN(aId) && !Number.isNaN(bId) ? aId - bId : String(a.id).localeCompare(String(b.id));
      } else {
        comparison = String(a.name ?? '').localeCompare(String(b.name ?? ''), undefined, { sensitivity: 'base' });
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    const total = sortedProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const pagedProducts = sortedProducts.slice(offset, offset + limit);

    return {
      status: 200,
      message: 'List of products by category',
      data: pagedProducts,
      meta: { page, limit, total, totalPages },
    };
  }
}
