import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODE } from 'src/common/constants/error-code';
import { rethrowDbError } from 'src/common/utils/db-error';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto';
import { CreateProductVariantDto } from '../dto/create-product-variant.dto';
import { ListProductsDto } from '../dto/list-products.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { SubCategory } from '../entities/category/sub-category.entity';
import { ProductVariant } from '../entities/product/product-variant.entity';
import { Product } from '../entities/product/product.entity';

const RELATIONS = { category: { category: true }, variants: true } as const;

type VariantInput = CreateProductVariantDto & { id?: string };

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product) private readonly products: Repository<Product>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findAll(query: ListProductsDto) {
    const { page = 1, limit = 20, search, status, categoryId } = query;
    const qb = this.products
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.category', 'sc')
      .leftJoinAndSelect('sc.category', 'c')
      .leftJoinAndSelect('p.variants', 'v')
      .orderBy('p.createdAt', 'DESC')
      .addOrderBy('v.createdAt', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);
    if (search) qb.andWhere('p.name ILIKE :search', { search: `%${search}%` });
    if (status) qb.andWhere('p.status = :status', { status });
    if (categoryId) qb.andWhere('p.categoryId = :categoryId', { categoryId });
    const [items, total] = await qb.getManyAndCount();
    return { items, total, page, limit };
  }

  async findOne(id: string) {
    const product = await this.products.findOne({
      where: { id },
      relations: RELATIONS,
    });
    if (!product) throw new NotFoundException(ERROR_CODE.PRODUCT_NOT_FOUND);
    return product;
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
