import { CoreSoftDeleteEntity } from 'src/entities/core.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { SubCategory } from '../category/sub-category.entity';
import { ProductVariant } from './product-variant.entity';

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export const INDEX_UNIQUE_PRODUCT_SLUG_CONSTRAINT =
  'idx_uq_product_slug_constraint';

@Entity({
  name: 'products',
})
@Index(INDEX_UNIQUE_PRODUCT_SLUG_CONSTRAINT, ['slug'], { unique: true })
export class Product extends CoreSoftDeleteEntity {
  constructor(partial: Partial<Product>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.DRAFT,
  })
  status: ProductStatus;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'thumbnail_url',
    nullable: true,
  })
  thumbnailUrl: string | null;

  @Column({ type: 'uuid', name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => SubCategory, (category) => category.products, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'category_id' })
  category: SubCategory;

  @OneToMany(() => ProductVariant, (variant) => variant.product, {
    cascade: ['insert', 'update'],
  })
  variants: ProductVariant[];
}
