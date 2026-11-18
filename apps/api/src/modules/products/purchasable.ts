import { ProductVariant } from './entities/product/product-variant.entity';
import { ProductStatus } from './entities/product/product.entity';

/**
 * A variant can be bought only while it is active and its product is on
 * sale. The product relation must be loaded.
 */
export function isPurchasable(variant?: ProductVariant | null): boolean {
  return (
    !!variant?.isActive && variant.product?.status === ProductStatus.ACTIVE
  );
}
