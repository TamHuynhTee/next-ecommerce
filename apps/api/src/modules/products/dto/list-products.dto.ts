import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ProductStatus } from '../entities/product/product.entity';

export enum ProductSort {
  NEWEST = 'newest',
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
}

export class ListProductsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  /** Id of a SubCategory. */
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  /** Id of a top-level Category (matches all of its sub-categories). */
  @IsUUID()
  @IsOptional()
  parentCategoryId?: string;

  /** Lowest variant price, in whole currency units. */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  minPrice?: number;

  /** Highest variant price, in whole currency units. */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  maxPrice?: number;

  @IsEnum(ProductSort)
  @IsOptional()
  sort?: ProductSort = ProductSort.NEWEST;
}
