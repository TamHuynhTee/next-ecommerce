import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODE } from 'src/common/constants/error-code';
import { ProductVariant } from 'src/modules/products/entities/product/product-variant.entity';
import { isPurchasable } from 'src/modules/products/purchasable';
import { Repository } from 'typeorm';
import { Wishlist } from '../users/entities/wishlist.entity';

export type WishlistLine = {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  /** Regular price (whole VND). */
  price: number;
  /** Price actually charged (whole VND). */
  discountedPrice: number;
  stock: number;
  imageUrl: string | null;
};

export type WishlistView = { items: WishlistLine[] };

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist) private readonly wishlist: Repository<Wishlist>,
    @InjectRepository(ProductVariant)
    private readonly variants: Repository<ProductVariant>,
  ) {}

  /** Most recently added first; products that are no longer on sale are hidden. */
  async get(userId: string): Promise<WishlistView> {
    const rows = await this.wishlist.find({
      where: { userId },
      relations: { productVariant: { product: true } },
      order: { createdAt: 'DESC' },
    });
    return {
      items: rows
        .filter((row) => isPurchasable(row.productVariant))
        .map((row) => this.toLine(row.productVariant)),
    };
  }

  /** Adding the same variant twice is a no-op. */
  async add(userId: string, variantId: string) {
    const variant = await this.variants.findOne({
      where: { id: variantId },
      relations: { product: true },
    });
    if (!isPurchasable(variant)) {
      throw new NotFoundException(ERROR_CODE.VARIANT_NOT_AVAILABLE);
    }
    await this.wishlist
      .createQueryBuilder()
      .insert()
      .values({ userId, productVariantId: variantId })
      .orIgnore()
      .execute();
    return this.get(userId);
  }

  async remove(userId: string, variantId: string) {
    await this.wishlist.delete({ userId, productVariantId: variantId });
    return this.get(userId);
  }

  async clear(userId: string) {
    await this.wishlist.delete({ userId });
    return this.get(userId);
  }

  /** Folds a guest wishlist in after sign-in, skipping anything unavailable. */
  async merge(userId: string, variantIds: string[]) {
    for (const variantId of new Set(variantIds)) {
      try {
        await this.add(userId, variantId);
      } catch (error) {
        if (error instanceof NotFoundException) continue;
        throw error;
      }
    }
    return this.get(userId);
  }

  private toLine(variant: ProductVariant): WishlistLine {
    const product = variant.product;
    const unitPrice = Number(variant.unitPrice);
    return {
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      title: variant.name ? `${product.name} - ${variant.name}` : product.name,
      price: variant.originalPrice ? Number(variant.originalPrice) : unitPrice,
      discountedPrice: unitPrice,
      stock: variant.stock,
      imageUrl: variant.imageUrl ?? product.thumbnailUrl,
    };
  }
}
