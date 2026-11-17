import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

/** Lowercase kebab-case slug, e.g. "fashion-men-tops". */
export const IsSlug = (max: number) =>
  applyDecorators(
    IsString(),
    IsNotEmpty(),
    MaxLength(max),
    Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'slug must be lowercase kebab-case',
    }),
  );
