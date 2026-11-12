import { Timestamp } from 'src/entities';
import { ProductVariant } from 'src/modules/products/entities/product/product-variant.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';

export const CHECK_VALID_CART_ITEM_QUANTITY_CONSTRAINT =
  'chk_valid_cart_item_quantity_constraint';

@Entity('cart_items')
@Check(CHECK_VALID_CART_ITEM_QUANTITY_CONSTRAINT, '"quantity" > 0')
export class CartItem extends Timestamp {
  constructor(partial: Partial<CartItem>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryColumn({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @ManyToOne(() => User, (user) => user.cart, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @PrimaryColumn({
    type: 'uuid',
    name: 'product_variant_id',
  })
  productVariantId: string;

  @ManyToOne(() => ProductVariant, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;

  @Column({ type: 'integer', default: 1 })
  quantity: number;
}
