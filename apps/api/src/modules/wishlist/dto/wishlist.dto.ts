import { ArrayMaxSize, IsArray, IsUUID } from 'class-validator';

export class AddWishlistItemDto {
  @IsUUID()
  variantId: string;
}

export class MergeWishlistDto {
  @IsArray()
  @ArrayMaxSize(100)
  @IsUUID('all', { each: true })
  variantIds: string[];
}
