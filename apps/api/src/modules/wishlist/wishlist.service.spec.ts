import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProductVariant } from '../products/entities/product/product-variant.entity';
import { ProductStatus } from '../products/entities/product/product.entity';
import { Wishlist } from '../users/entities/wishlist.entity';
import { WishlistService } from './wishlist.service';

// @nestjs/typeorm is ESM-only; only its injection decorator is needed here.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
}));

const USER = 'u1';

const variant = (
  id: string,
  opts: { isActive?: boolean; status?: ProductStatus } = {},
) =>
  ({
    id,
    name: null,
    stock: 5,
    isActive: opts.isActive ?? true,
    unitPrice: '90000',
    originalPrice: '120000',
    imageUrl: null,
    product: {
      id: 'p1',
      slug: 'tee',
      name: 'Tee',
      thumbnailUrl: null,
      status: opts.status ?? ProductStatus.ACTIVE,
    },
  }) as unknown as ProductVariant;

function setup(variants: ProductVariant[], saved: string[] = []) {
  const catalog = new Map(variants.map((v) => [v.id, v]));
  const stored = new Set(saved);
  const inserts: string[] = [];

  const wishlistRepo = {
    find: jest.fn(async () =>
      [...stored].map((id) => ({
        userId: USER,
        productVariantId: id,
        productVariant: catalog.get(id),
      })),
    ),
    delete: jest.fn(async (where: { productVariantId?: string }) => {
      if (where.productVariantId) stored.delete(where.productVariantId);
      else stored.clear();
    }),
    createQueryBuilder: () => {
      let values: { productVariantId: string };
      const qb = {
        insert: () => qb,
        values: (v: { productVariantId: string }) => {
          values = v;
          return qb;
        },
        orIgnore: () => qb,
        execute: async () => {
          inserts.push(values.productVariantId);
          stored.add(values.productVariantId);
        },
      };
      return qb;
    },
  };
  const variantRepo = {
    findOne: jest.fn(async ({ where }) => catalog.get(where.id) ?? null),
  };
  const service = new WishlistService(
    wishlistRepo as unknown as Repository<Wishlist>,
    variantRepo as unknown as Repository<ProductVariant>,
  );
  return { service, stored, inserts };
}

describe('WishlistService', () => {
  it('lists prices from the catalog and hides products that are off sale', async () => {
    const { service } = setup(
      [variant('v1'), variant('v2', { status: ProductStatus.DRAFT })],
      ['v1', 'v2'],
    );
    const { items } = await service.get(USER);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      variantId: 'v1',
      price: 120000,
      discountedPrice: 90000,
    });
  });

  it('adds an available variant', async () => {
    const { service, stored } = setup([variant('v1')]);
    await service.add(USER, 'v1');
    expect(stored.has('v1')).toBe(true);
  });

  it('rejects missing and inactive variants', async () => {
    const { service } = setup([variant('v2', { isActive: false })]);
    await expect(service.add(USER, 'v2')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.add(USER, 'nope')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('removes and clears', async () => {
    const { service, stored } = setup(
      [variant('v1'), variant('v2')],
      ['v1', 'v2'],
    );
    await service.remove(USER, 'v1');
    expect([...stored]).toEqual(['v2']);
    await service.clear(USER);
    expect(stored.size).toBe(0);
  });

  it('merges a guest wishlist once per variant and skips unavailable ones', async () => {
    const { service, stored, inserts } = setup([
      variant('v1'),
      variant('v2', { isActive: false }),
    ]);
    await service.merge(USER, ['v1', 'v1', 'v2', 'gone']);
    expect([...stored]).toEqual(['v1']);
    expect(inserts).toEqual(['v1']);
  });
});
