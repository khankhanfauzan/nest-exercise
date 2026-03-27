import { Injectable } from '@nestjs/common';
import { categoriesMock } from 'src/data/categories.mock';
import { Category } from 'src/types/category.type';

@Injectable()
export class CategoriesRepository {
  private categories: Category[] = categoriesMock;

  findAll(): Category[] {
    return this.categories;
  }

  findOne(id: string): Category | undefined {
    return this.categories.find((category) => category.id === id);
  }

  create(category: Category): Category {
    this.categories.push(category);
    return category;
  }

  update(id: string, updates: Partial<Category>): Category | undefined {
    const index = this.categories.findIndex((category) => category.id === id);
    if (index === -1) return undefined;
    this.categories[index] = { ...this.categories[index], ...updates };
    return this.categories[index];
  }

  remove(id: string): boolean {
    const index = this.categories.findIndex((category) => category.id === id);
    if (index === -1) return false;
    this.categories.splice(index, 1);
    return true;
  }
}
