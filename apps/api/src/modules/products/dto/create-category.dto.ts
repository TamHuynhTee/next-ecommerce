import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CategoryStatus } from '../entities/category/category.entity';
import { IsSlug } from './slug';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsSlug(150)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsEnum(CategoryStatus)
  @IsOptional()
  status?: CategoryStatus;
}
