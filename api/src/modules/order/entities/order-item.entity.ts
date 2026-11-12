import { bigintTransformer, CoreEntity } from 'src/entities';
import { ProductVariant } from 'src/modules/products/entities/product/product-variant.entity';
import { Check, Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { OrderDetail } from './order.entity';

export const UNIQUE_ORDER_ID_PRODUCT_VARIANT_ID_CONSTRAINT =
  'uq_order_id_product_variant_id_constraint';

export const CHECK_VALID_ORDER_ITEM_QUANTITY_CONSTRAINT =
  'chk_valid_order_item_quantity_constraint';
export const CHECK_VALID_ORDER_ITEM_PRODUCT_UNIT_PRICE_CONSTRAINT =
  'chk_valid_order_item_product_unit_price_constraint';
export const CHECK_VALID_ORDER_ITEM_LINE_TOTAL_CONSTRAINT =
  'chk_valid_order_item_line_total_constraint';

@Entity({ name: 'order_items' })
@Check(CHECK_VALID_ORDER_ITEM_QUANTITY_CONSTRAINT, '"quantity" > 0')
@Check(
  CHECK_VALID_ORDER_ITEM_PRODUCT_UNIT_PRICE_CONSTRAINT,
  '"product_unit_price" >= 0',
)
@Check(
  CHECK_VALID_ORDER_ITEM_LINE_TOTAL_CONSTRAINT,
  '"line_total" = "product_unit_price" * "quantity"',
)
@Unique(UNIQUE_ORDER_ID_PRODUCT_VARIANT_ID_CONSTRAINT, [
  'orderId',
  'productVariantId',
])
export class OrderItem extends CoreEntity {
  constructor(partial: Partial<OrderItem>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @ManyToOne(() => OrderDetail, (u) => u.items, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderDetail;

  @Column({
    type: 'uuid',
    name: 'product_variant_id',
    nullable: true,
  })
  productVariantId: string | null;

  @ManyToOne(() => ProductVariant, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant | null;

  @Column({ name: 'product_name' })
  productName: string;

  @Column({ name: 'product_slug' })
  productSlug: string;

  @Column({ name: 'product_sku' })
  productSku: string;

  @Column({
    type: 'bigint',
    transformer: bigintTransformer,
    name: 'product_unit_price',
  })
  productUnitPrice: string;

  @Column({
    type: 'bigint',
    name: 'product_original_price',
    nullable: true,
    transformer: bigintTransformer,
  })
  productOriginalPrice: string | null;

  @Column({
    type: 'char',
    length: 3,
  })
  currency: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({
    type: 'bigint',
    name: 'line_total',
    transformer: bigintTransformer,
  })
  lineTotal: string;
}
