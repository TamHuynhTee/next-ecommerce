import { bigintTransformer, CoreSoftDeleteEntity } from 'src/entities';
import { Wishlist } from 'src/modules/users/entities/wishlist.entity';
import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Product } from './product.entity';

export const INDEX_UNIQUE_PRODUCT_VARIANT_SKU_CONSTRAINT =
  'idx_uq_product_variant_sku_constraint';

export const CHECK_VALID_PRODUCT_VARIANT_STOCK_CONSTRAINT =
  'chk_product_variant_stock_constraint';
export const CHECK_VALID_PRODUCT_VARIANT_UNIT_PRICE_CONSTRAINT =
  'chk_product_variant_unit_price_constraint';
export const CHECK_VALID_PRODUCT_VARIANT_ORIGINAL_PRICE_CONSTRAINT =
  'chk_product_variant_original_price_constraint';

@Entity({ name: 'product_variants' })
@Check(CHECK_VALID_PRODUCT_VARIANT_STOCK_CONSTRAINT, '"stock" >= 0')
@Check(CHECK_VALID_PRODUCT_VARIANT_UNIT_PRICE_CONSTRAINT, '"unit_price" >= 0')
@Check(
  CHECK_VALID_PRODUCT_VARIANT_ORIGINAL_PRICE_CONSTRAINT,
  '"original_price" >= 0',
)
@Index(INDEX_UNIQUE_PRODUCT_VARIANT_SKU_CONSTRAINT, ['sku'], { unique: true })
export class ProductVariant extends CoreSoftDeleteEntity {
  constructor(partial: Partial<ProductVariant>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ type: 'varchar', length: 100 })
  sku: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  color: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  size: string | null;

  @Column({
    type: 'bigint',
    transformer: bigintTransformer,
    name: 'unit_price',
  })
  unitPrice: string;

  @Column({
    type: 'bigint',
    name: 'original_price',
    nullable: true,
    transformer: bigintTransformer,
  })
  originalPrice: string | null;

  @Column({
    type: 'char',
    length: 3,
  })
  currency: string; // ISO 4217

  @Column({ type: 'integer', default: 0 })
  stock: number;

  @Column({ type: 'varchar', length: 500, name: 'image_url', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'jsonb', default: {} })
  attributes: Record<string, string>;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.variants, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @OneToMany(() => Wishlist, (a) => a.productVariant, {
    cascade: ['insert', 'update'],
  })
  wishlists: Wishlist[];
}
