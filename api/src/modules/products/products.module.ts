import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product/product.entity';
import { ProductVariant } from './entities/product/product-variant.entity';
import { ProductVariantsService } from './services/product-variants.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductVariantsService],
  imports: [TypeOrmModule.forFeature([Product, ProductVariant])],
})
export class ProductModule {}
