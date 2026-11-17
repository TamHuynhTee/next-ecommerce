import { OmitType, PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { CreateProductDto } from './create-product.dto';
import { UpdateProductVariantDto } from './create-product-variant.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['variants'] as const),
) {
  /**
   * Full list of variants after the update: entries with an id are updated,
   * entries without are inserted, and existing variants not listed are removed.
   */
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantDto)
  @IsOptional()
  variants?: UpdateProductVariantDto[];
}
