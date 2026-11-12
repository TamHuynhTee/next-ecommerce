import { CoreSoftDeleteEntity } from 'src/entities/core.entity';
import { Column, Entity, Index, OneToMany } from 'typeorm';
import { SubCategory } from './sub-category.entity';

export enum CategoryStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export const INDEX_UNIQUE_CATEGORY_SLUG_CONSTRAINT =
  'idx_uq_category_slug_constraint';

@Entity({
  name: 'categories',
})
@Index(INDEX_UNIQUE_CATEGORY_SLUG_CONSTRAINT, ['slug'], { unique: true })
export class Category extends CoreSoftDeleteEntity {
  constructor(partial: Partial<Category>) {
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
    enum: CategoryStatus,
    default: CategoryStatus.ACTIVE,
  })
  status: CategoryStatus;

  @OneToMany(() => SubCategory, (sub) => sub.category, {
    cascade: ['insert', 'update'],
  })
  subCategories: SubCategory[];
}
