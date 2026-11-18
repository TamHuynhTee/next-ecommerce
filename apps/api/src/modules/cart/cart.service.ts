import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODE } from 'src/common/constants/error-code';
import { shippingFeeFor } from 'src/common/utils/shipping';
import { ProductVariant } from 'src/modules/products/entities/product/product-variant.entity';
import { isPurchasable } from 'src/modules/products/purchasable';
import { Repository } from 'typeorm';
import { AddCartItemDto, MAX_LINE_QUANTITY } from './dto/cart.dto';
import { CartItem } from './entities/cart-item.entity';

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  /** Regular price (whole VND). */
  price: number;
  /** Price actually charged (whole VND). */
  discountedPrice: number;
  quantity: number;
  stock: number;
  imageUrl: string | null;
};

export type CartView = {
  items: CartLine[];
  subtotal: number;
  shippingFee: number;
  total: number;
};

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem) private readonly cart: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private readonly variants: Repository<ProductVariant>,
  ) {}

  /** Prices always come from the database, never from the client. */
  async get(userId: string): Promise<CartView> {
    const rows = await this.cart.find({
      where: { userId },
      relations: { productVariant: { product: true } },
      order: { createdAt: 'ASC' },
    });

    const items = rows
      .filter((row) => isPurchasable(row.productVariant))
      .map((row) => this.toLine(row));
    const subtotal = items.reduce(
      (sum, line) => sum + line.discountedPrice * line.quantity,
      0,
    );
    const shippingFee = shippingFeeFor(subtotal);
    return { items, subtotal, shippingFee, total: subtotal + shippingFee };
  }

  async add(userId: string, { variantId, quantity }: AddCartItemDto) {
    const variant = await this.findPurchasable(variantId);
    if (variant.stock < 1)
      throw new BadRequestException(ERROR_CODE.OUT_OF_STOCK);

    const existing = await this.cart.findOne({
      where: { userId, productVariantId: variantId },
    });
    const next = this.clamp(
      (existing?.quantity ?? 0) + quantity,
      variant.stock,
    );
    await this.cart.save(
      new CartItem({ userId, productVariantId: variantId, quantity: next }),
    );
    return this.get(userId);
  }

  async setQuantity(userId: string, variantId: string, quantity: number) {
    const existing = await this.cart.findOne({
      where: { userId, productVariantId: variantId },
    });
    if (!existing) throw new NotFoundException(ERROR_CODE.CART_ITEM_NOT_FOUND);

    const variant = await this.findPurchasable(variantId);
    if (variant.stock < 1)
      throw new BadRequestException(ERROR_CODE.OUT_OF_STOCK);

    existing.quantity = this.clamp(quantity, variant.stock);
    await this.cart.save(existing);
    return this.get(userId);
  }

  async remove(userId: string, variantId: string) {
    await this.cart.delete({ userId, productVariantId: variantId });
    return this.get(userId);
  }

  async clear(userId: string) {
    await this.cart.delete({ userId });
    return this.get(userId);
  }

  /**
   * Folds a guest cart into the user's cart after sign-in. Quantities add up;
   * lines that are no longer purchasable are skipped instead of failing the
   * whole merge.
   */
  async merge(userId: string, lines: AddCartItemDto[]) {
    const totals = new Map<string, number>();
    for (const line of lines) {
      totals.set(
        line.variantId,
        (totals.get(line.variantId) ?? 0) + line.quantity,
      );
    }

    for (const [variantId, quantity] of totals) {
      try {
        await this.add(userId, { variantId, quantity });
      } catch (error) {
        if (
          error instanceof NotFoundException ||
          error instanceof BadRequestException
        ) {
          continue;
        }
        throw error;
      }
    }
    return this.get(userId);
  }

  private clamp(quantity: number, stock: number) {
    return Math.min(quantity, stock, MAX_LINE_QUANTITY);
  }

  private async findPurchasable(variantId: string) {
    const variant = await this.variants.findOne({
      where: { id: variantId },
      relations: { product: true },
    });
    if (!variant || !isPurchasable(variant)) {
      throw new NotFoundException(ERROR_CODE.VARIANT_NOT_AVAILABLE);
    }
    return variant;
  }

  private toLine(row: CartItem): CartLine {
    const variant = row.productVariant;
    const product = variant.product;
    const unitPrice = Number(variant.unitPrice);
    return {
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      title: variant.name ? `${product.name} - ${variant.name}` : product.name,
      price: variant.originalPrice ? Number(variant.originalPrice) : unitPrice,
      discountedPrice: unitPrice,
      quantity: row.quantity,
      stock: variant.stock,
      imageUrl: variant.imageUrl ?? product.thumbnailUrl,
    };
  }
}
