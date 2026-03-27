import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { CategoriesRepository } from './categories.repository';
import { ProductsRepository } from 'src/products/products.repository';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, CategoriesRepository, ProductsRepository],
  exports: [CategoriesRepository],
})
export class CategoriesModule { }
