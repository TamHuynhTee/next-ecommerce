import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { ProductStatus } from '../entities/product/product.entity';
import { CreateProductVariantDto } from './create-product-variant.dto';
import { IsSlug } from './slug';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsSlug(150)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(ProductStatus)
  @IsOptional()
  status?: ProductStatus;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  thumbnailUrl?: string | null;

  /** Id of the SubCategory the product belongs to. */
  @IsUUID()
  categoryId: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
