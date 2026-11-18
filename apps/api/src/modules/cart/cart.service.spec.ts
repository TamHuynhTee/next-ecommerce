import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductVariant } from '../products/entities/product/product-variant.entity';
import { ProductStatus } from '../products/entities/product/product.entity';
import { CartService } from './cart.service';
import { CartItem } from './entities/cart-item.entity';

// @nestjs/typeorm is ESM-only; only its injection decorator is needed here.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

const USER = 'u1';

type VariantInput = Partial<{
  id: string;
  stock: number;
  isActive: boolean;
  status: ProductStatus;
  unitPrice: string;
  originalPrice: string | null;
}>;

const variant = (input: VariantInput = {}) =>
  ({
    id: input.id ?? 'v1',
    name: null,
    stock: input.stock ?? 5,
    isActive: input.isActive ?? true,
    unitPrice: input.unitPrice ?? '90000',
    originalPrice: input.originalPrice ?? '120000',
    imageUrl: null,
    product: {
      id: 'p1',
      slug: 'tee',
      name: 'Tee',
      thumbnailUrl: null,
      status: input.status ?? ProductStatus.ACTIVE,
    },
  }) as unknown as ProductVariant;

function setup(options: {
  variants?: ProductVariant[];
  items?: Array<{ variantId: string; quantity: number }>;
}) {
  const stored = new Map(
    (options.items ?? []).map((i) => [i.variantId, i.quantity]),
  );
  const catalog = new Map((options.variants ?? []).map((v) => [v.id, v]));

  const cartRepo = {
    find: jest.fn(async () =>
      [...stored].map(([id, quantity]) => ({
        userId: USER,
        productVariantId: id,
        quantity,
        productVariant: catalog.get(id),
      })),
    ),
    findOne: jest.fn(async ({ where }) =>
      stored.has(where.productVariantId)
        ? {
            userId: USER,
            productVariantId: where.productVariantId,
            quantity: stored.get(where.productVariantId),
          }
        : null,
    ),
    save: jest.fn(async (item: CartItem) => {
      stored.set(item.productVariantId, item.quantity);
      return item;
    }),
    delete: jest.fn(async (where: { productVariantId?: string }) => {
      if (where.productVariantId) stored.delete(where.productVariantId);
      else stored.clear();
    }),
  };
  const variantRepo = {
    findOne: jest.fn(async ({ where }) => catalog.get(where.id) ?? null),
  };

  const service = new CartService(
    cartRepo as unknown as Repository<CartItem>,
    variantRepo as unknown as Repository<ProductVariant>,
  );
  return { service, stored };
}

describe('CartService', () => {
  it('prices lines from the catalog and totals the discounted price', async () => {
    const { service } = setup({
      variants: [variant()],
      items: [{ variantId: 'v1', quantity: 2 }],
    });
    const cart = await service.get(USER);
    expect(cart.items[0]).toMatchObject({
      price: 120000,
      discountedPrice: 90000,
      quantity: 2,
    });
    expect(cart.subtotal).toBe(180000);
  });

  it('hides lines whose product is no longer on sale', async () => {
    const { service } = setup({
      variants: [variant({ status: ProductStatus.DRAFT })],
      items: [{ variantId: 'v1', quantity: 1 }],
    });
    expect((await service.get(USER)).items).toEqual([]);
  });

  it('adds up quantities and caps them at the stock', async () => {
    const { service, stored } = setup({
      variants: [variant({ stock: 3 })],
      items: [{ variantId: 'v1', quantity: 2 }],
    });
    await service.add(USER, { variantId: 'v1', quantity: 5 });
    expect(stored.get('v1')).toBe(3);
  });

  it('rejects out-of-stock and unavailable variants', async () => {
    const { service } = setup({
      variants: [variant({ stock: 0 }), variant({ id: 'v2', isActive: false })],
    });
    await expect(
      service.add(USER, { variantId: 'v1', quantity: 1 }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.add(USER, { variantId: 'v2', quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.add(USER, { variantId: 'missing', quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses to update a line that is not in the cart', async () => {
    const { service } = setup({ variants: [variant()] });
    await expect(service.setQuantity(USER, 'v1', 2)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('merges a guest cart, summing duplicates and skipping bad lines', async () => {
    const { service, stored } = setup({
      variants: [variant({ stock: 10 }), variant({ id: 'v2', stock: 0 })],
      items: [{ variantId: 'v1', quantity: 1 }],
    });
    await service.merge(USER, [
      { variantId: 'v1', quantity: 2 },
      { variantId: 'v1', quantity: 1 },
      { variantId: 'v2', quantity: 1 },
      { variantId: 'gone', quantity: 1 },
    ]);
    expect(stored.get('v1')).toBe(4);
    expect(stored.has('v2')).toBe(false);
  });
});
