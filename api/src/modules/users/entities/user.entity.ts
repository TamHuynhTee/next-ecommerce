import { Exclude } from 'class-transformer';
import { CoreSoftDeleteEntity } from 'src/entities/core.entity';
import { CartItem } from 'src/modules/cart/entities/cart-item.entity';
import { OrderDetail } from 'src/modules/order/entities/order.entity';
import { Column, Entity, OneToMany, Unique } from 'typeorm';
import { Address } from './address.entity';
import { Wishlist } from './wishlist.entity';

export const UNIQUE_USERNAME_CONSTRAINT = 'uq_username_constraint';
export const UNIQUE_EMAIL_CONSTRAINT = 'uq_email_constraint';

@Entity({ name: 'users' })
@Unique(UNIQUE_USERNAME_CONSTRAINT, ['username'])
@Unique(UNIQUE_EMAIL_CONSTRAINT, ['email'])
export class User extends CoreSoftDeleteEntity {
  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  avatar: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'first_name',
  })
  firstName: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'last_name',
  })
  lastName: string | null;

  @Column({
    type: 'varchar',
    length: 24,
    nullable: false,
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
    length: 100,
    name: 'hashed_password',
  })
  @Exclude()
  hashedPassword: string;

  @Column({
    type: 'date',
    nullable: true,
    name: 'date_of_birth',
  })
  dateOfBirth: string | null;

  @OneToMany(() => Address, (a) => a.user, {
    cascade: ['insert', 'update'],
  })
  addresses: Address[];

  @OneToMany(() => Wishlist, (a) => a.user, {
    cascade: ['insert', 'update'],
  })
  wishlists: Wishlist[];

  @OneToMany(() => OrderDetail, (a) => a.user, {
    cascade: ['insert', 'update'],
  })
  orders: OrderDetail[];

  @OneToMany(() => CartItem, (c) => c.user, {
    cascade: ['insert', 'update', 'remove'],
  })
  cart: CartItem[];
}
