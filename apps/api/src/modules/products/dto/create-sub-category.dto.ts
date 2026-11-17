import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsSlug } from './slug';

export class CreateSubCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsSlug(220)
  slug: string;

  @IsString()
  @IsOptional()
  description?: string | null;
}
