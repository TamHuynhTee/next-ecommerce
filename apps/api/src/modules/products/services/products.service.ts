import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODE } from 'src/common/constants/error-code';
import { rethrowDbError } from 'src/common/utils/db-error';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { ListProductsDto, ProductSort } from '../dto/list-products.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SubCategory } from '../entities/category/sub-category.entity';
import { ProductVariant } from '../entities/product/product-variant.entity';
import { Product, ProductStatus } from '../entities/product/product.entity';

const RELATIONS = { category: { category: true }, variants: true } as const;

type VariantInput = CreateProductVariantDto & { id?: string };

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /**
   * Lists products. Anyone but an admin only sees active products and their
   * active variants.
   */
  async findAll(query: ListProductsDto, includeUnpublished = false) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      categoryId,
      parentCategoryId,
      minPrice,
      maxPrice,
      sort = ProductSort.NEWEST,
    } = query;

    const filtered = this.products.createQueryBuilder('p');
    if (search)
      filtered.andWhere('p.name ILIKE :search', { search: `%${search}%` });
    if (includeUnpublished) {
      if (status) filtered.andWhere('p.status = :status', { status });
    } else {
      filtered.andWhere('p.status = :status', { status: ProductStatus.ACTIVE });
    }
    if (categoryId)
      filtered.andWhere('p.categoryId = :categoryId', { categoryId });
    if (parentCategoryId) {
      filtered.andWhere(
        'p.categoryId IN (SELECT sc.id FROM sub_categories sc WHERE sc.parent_id = :parentCategoryId AND sc.deleted_at IS NULL)',
        { parentCategoryId },
      );
    }
    // A product matches a price range when any of its active variants does.
    const variantPrice =
      'SELECT pv.product_id FROM product_variants pv WHERE pv.deleted_at IS NULL AND pv.is_active = true';
    if (minPrice !== undefined || maxPrice !== undefined) {
      const conditions = [variantPrice];
      if (minPrice !== undefined) conditions.push('pv.unit_price >= :minPrice');
      if (maxPrice !== undefined) conditions.push('pv.unit_price <= :maxPrice');
      filtered.andWhere(`p.id IN (${conditions.join(' AND ')})`, {
        minPrice,
        maxPrice,
      });
    }

    const total = await filtered.clone().getCount();

    // Page the ids first: ordering by an aggregate does not combine with
    // joined collections and skip/take, so the entities are loaded afterwards.
    const lowestPrice =
      'SELECT MIN(pv.unit_price) FROM product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.is_active = true';
    const idQuery = filtered.clone().select('p.id', 'id');
    if (sort === ProductSort.NEWEST) {
      idQuery.orderBy('p.createdAt', 'DESC');
    } else {
      idQuery
        .addSelect(`(${lowestPrice})`, 'lowest_price')
        .orderBy(
          'lowest_price',
          sort === ProductSort.PRICE_ASC ? 'ASC' : 'DESC',
          'NULLS LAST',
        )
        .addOrderBy('p.createdAt', 'DESC');
    }
    const rows = await idQuery
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: string }>();
    const ids = rows.map((r) => r.id);

    const found = ids.length
      ? await this.products
          .createQueryBuilder('p')
          .leftJoinAndSelect('p.category', 'sc')
          .leftJoinAndSelect('sc.category', 'c')
          .leftJoinAndSelect('p.variants', 'v')
          .where('p.id IN (:...ids)', { ids })
          .orderBy('v.createdAt', 'ASC')
          .getMany()
      : [];
    const byId = new Map(found.map((p) => [p.id, p]));
    const items = ids
      .map((id) => byId.get(id))
      .filter((p): p is Product => !!p)
      .map((p) => this.visibleTo(p, includeUnpublished));
    return { items, total, page, limit };
  }

  private visibleTo(product: Product, includeUnpublished: boolean) {
    if (!includeUnpublished) {
      product.variants = product.variants.filter((v) => v.isActive);
    }
    return product;
  }

  async findOne(id: string, includeUnpublished = true) {
    const product = await this.products.findOne({
      where: { id },
      relations: RELATIONS,
    });
    return this.assertVisible(product, includeUnpublished);
  }

  async findBySlug(slug: string, includeUnpublished = false) {
    const product = await this.products.findOne({
      where: { slug },
      relations: RELATIONS,
    });
    return this.assertVisible(product, includeUnpublished);
  }

  private assertVisible(product: Product | null, includeUnpublished: boolean) {
    if (
      !product ||
      (!includeUnpublished && product.status !== ProductStatus.ACTIVE)
    ) {
      throw new NotFoundException(ERROR_CODE.PRODUCT_NOT_FOUND);
    }
    return this.visibleTo(product, includeUnpublished);
  }

  private async assertSubCategory(manager: EntityManager, id: string) {
    const exists = await manager.exists(SubCategory, { where: { id } });
    if (!exists) throw new NotFoundException(ERROR_CODE.SUB_CATEGORY_NOT_FOUND);
  }

  private toVariant(input: VariantInput, productId?: string) {
    return new ProductVariant({
      ...input,
      originalPrice: input.originalPrice ?? null,
      attributes: (input.attributes ?? {}) as Record<string, string>,
      ...(productId ? { productId } : {}),
    });
  }

  async create(dto: CreateProductDto) {
    try {
      const id = await this.dataSource.transaction(async (manager) => {
        await this.assertSubCategory(manager, dto.categoryId);
        const { variants, ...fields } = dto;
        const product = manager.create(Product, {
          ...fields,
          variants: variants.map((v) => this.toVariant(v)),
        });
        return (await manager.save(product)).id;
      });
      return await this.findOne(id);
    } catch (e) {
      rethrowDbError(e);
    }
  }

  async update(id: string, dto: UpdateProductDto) {
    try {
      await this.dataSource.transaction(async (manager) => {
        const product = await manager.findOne(Product, {
          where: { id },
          relations: { variants: true },
        });
        if (!product) throw new NotFoundException(ERROR_CODE.PRODUCT_NOT_FOUND);
        if (dto.categoryId)
          await this.assertSubCategory(manager, dto.categoryId);

        const { variants, ...fields } = dto;
        const { variants: existing } = product;
        delete (product as Partial<Product>).variants;
        await manager.save(Object.assign(product, fields));

        if (variants) {
          const keep = new Set(variants.map((v) => v.id).filter(Boolean));
          const removed = existing.filter((v) => !keep.has(v.id));
          if (removed.length) await manager.softRemove(removed);
          for (const input of variants) {
            const known = input.id && existing.find((v) => v.id === input.id);
            if (input.id && !known)
              throw new NotFoundException(ERROR_CODE.PRODUCT_NOT_FOUND);
            const { id: _ignored, ...data } = input;
            await manager.save(
              known
                ? Object.assign(known, this.toVariant(data))
                : this.toVariant(data, id),
            );
          }
        }
      });
      return await this.findOne(id);
    } catch (e) {
      rethrowDbError(e);
    }
  }

  async remove(id: string) {
    await this.dataSource.transaction(async (manager) => {
      const exists = await manager.exists(Product, { where: { id } });
      if (!exists) throw new NotFoundException(ERROR_CODE.PRODUCT_NOT_FOUND);
      await manager.softDelete(ProductVariant, { productId: id });
      await manager.softDelete(Product, id);
    });
  }
}
