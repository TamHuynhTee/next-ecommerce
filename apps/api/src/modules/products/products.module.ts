import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriesController } from './categories.controller';
import { Category } from './entities/category/category.entity';
import { SubCategory } from './entities/category/sub-category.entity';
import { ProductVariant } from './entities/product/product-variant.entity';
import { Product } from './entities/product/product.entity';
import { ProductsController } from './products.controller';
import { CategoriesService } from './services/categories.service';
import { ProductsService } from './services/products.service';

@Module({
  controllers: [ProductsController, CategoriesController],
  providers: [ProductsService, CategoriesService],
  imports: [
    TypeOrmModule.forFeature([Product, ProductVariant, Category, SubCategory]),
  ],
})
export class ProductModule {}
