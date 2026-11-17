import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entities/product/product.entity';
import { ProductVariant } from '../entities/product/product-variant.entity';
import { ProductsService } from './products.service';

// @nestjs/typeorm is ESM-only; only its injection decorators are needed here.
jest.mock('@nestjs/typeorm', () => ({
  InjectRepository: () => () => undefined,
  InjectDataSource: () => () => undefined,
}));

const variant = (id: string, isActive: boolean) =>
  ({ id, isActive }) as ProductVariant;

const productWith = (status: ProductStatus) =>
  ({
    id: 'p1',
    slug: 'tee',
    status,
    variants: [variant('v1', true), variant('v2', false)],
  }) as Product;

const serviceReturning = (product: Product | null) =>
  new ProductsService(
    {
      findOne: jest.fn().mockResolvedValue(product),
    } as unknown as Repository<Product>,
    {} as never,
  );

describe('ProductsService visibility', () => {
  it('hides unpublished products from the public', async () => {
    const service = serviceReturning(productWith(ProductStatus.DRAFT));
    await expect(service.findBySlug('tee')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('only exposes active variants of an active product to the public', async () => {
    const service = serviceReturning(productWith(ProductStatus.ACTIVE));
    const product = await service.findBySlug('tee');
    expect(product.variants.map((v) => v.id)).toEqual(['v1']);
  });

  it('shows admins drafts with every variant', async () => {
    const service = serviceReturning(productWith(ProductStatus.DRAFT));
    const product = await service.findBySlug('tee', true);
    expect(product.variants).toHaveLength(2);
  });

  it('returns 404 for an unknown slug', async () => {
    const service = serviceReturning(null);
    await expect(service.findBySlug('nope', true)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
