import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsISO4217CurrencyCode,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ERROR_CODE } from 'src/common/constants/error-code';

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sku: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  color?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  size?: string;

  @Matches(/^\d+$/, {
    message: ERROR_CODE.INVALID_NUMBER,
  })
  unitPrice: string;

  @Matches(/^\d+$/, {
    message: ERROR_CODE.INVALID_NUMBER,
  })
  @IsOptional()
  originalPrice: string | null;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsISO4217CurrencyCode({ message: ERROR_CODE.INVALID_CURRENCY })
  currency: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  stock?: number;

  @IsUrl()
  @IsOptional()
  @MaxLength(500)
  imageUrl?: string;

  @IsObject()
  @IsOptional()
  attributes?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
