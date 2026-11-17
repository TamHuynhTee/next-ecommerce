import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ERROR_CODE } from 'src/common/constants/error-code';
import { rethrowDbError } from 'src/common/utils/db-error';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CreateSubCategoryDto } from '../dto/create-sub-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { UpdateSubCategoryDto } from '../dto/update-sub-category.dto';
import { Category } from '../entities/category/category.entity';
import { SubCategory } from '../entities/category/sub-category.entity';
import { Product } from '../entities/product/product.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categories: Repository<Category>,
    @InjectRepository(SubCategory)
    private readonly subCategories: Repository<SubCategory>,
    @InjectRepository(Product) private readonly products: Repository<Product>,
  ) {}

  findAll() {
    return this.categories.find({
      relations: { subCategories: true },
      order: { name: 'ASC', subCategories: { name: 'ASC' } },
    });
  }

  async findOne(id: string) {
    const category = await this.categories.findOne({
      where: { id },
      relations: { subCategories: true },
    });
    if (!category) throw new NotFoundException(ERROR_CODE.CATEGORY_NOT_FOUND);
    return category;
  }

  async create(dto: CreateCategoryDto) {
    try {
      return await this.categories.save(this.categories.create(dto));
    } catch (e) {
      rethrowDbError(e);
    }
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    try {
      return await this.categories.save(Object.assign(category, dto));
    } catch (e) {
      rethrowDbError(e);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    const children = await this.subCategories.count({
      where: { parentId: id },
    });
    if (children > 0)
      throw new ConflictException(ERROR_CODE.CATEGORY_HAS_CHILDREN);
    await this.categories.softDelete(id);
  }

  async createSub(categoryId: string, dto: CreateSubCategoryDto) {
    await this.findOne(categoryId);
    try {
      return await this.subCategories.save(
        this.subCategories.create({ ...dto, parentId: categoryId }),
      );
    } catch (e) {
      rethrowDbError(e);
    }
  }

  private async findSub(id: string) {
    const sub = await this.subCategories.findOne({ where: { id } });
    if (!sub) throw new NotFoundException(ERROR_CODE.SUB_CATEGORY_NOT_FOUND);
    return sub;
  }

  async updateSub(id: string, dto: UpdateSubCategoryDto) {
    const sub = await this.findSub(id);
    try {
      return await this.subCategories.save(Object.assign(sub, dto));
    } catch (e) {
      rethrowDbError(e);
    }
  }

  async removeSub(id: string) {
    await this.findSub(id);
    const used = await this.products.count({ where: { categoryId: id } });
    if (used > 0)
      throw new ConflictException(ERROR_CODE.SUB_CATEGORY_HAS_PRODUCTS);
    await this.subCategories.softDelete(id);
  }
}
