import { CoreSoftDeleteEntity } from 'src/entities/core.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Product } from '../product/product.entity';
import { Category } from './category.entity';

export const INDEX_UNIQUE_SUB_CATEGORY_SLUG_CONSTRAINT =
  'idx_uq_sub_category_slug_constraint';

@Entity({
  name: 'sub_categories',
})
@Index(INDEX_UNIQUE_SUB_CATEGORY_SLUG_CONSTRAINT, ['slug'], { unique: true })
export class SubCategory extends CoreSoftDeleteEntity {
  constructor(partial: Partial<SubCategory>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 220 })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'uuid', name: 'parent_id' })
  parentId: string;

  @ManyToOne(() => Category, (product) => product.subCategories, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'parent_id' })
  category: Category;

  @OneToMany(() => Product, (variant) => variant.category, {
    cascade: ['insert', 'update'],
  })
  products: Product[];
}
