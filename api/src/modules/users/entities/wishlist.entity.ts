import { Timestamp } from 'src/entities';
import { ProductVariant } from 'src/modules/products/entities/product/product-variant.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'wishlists' })
export class Wishlist extends Timestamp {
  constructor(partial: Partial<Wishlist>) {
    super();
    Object.assign(this, partial);
  }

  @PrimaryColumn({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.wishlists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @PrimaryColumn({ type: 'uuid', name: 'product_variant_id' })
  productVariantId: string;

  @ManyToOne(() => ProductVariant, (p) => p.wishlists, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;
}
