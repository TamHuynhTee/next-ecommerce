import { bigintTransformer } from 'src/entities';
import { CoreEntity } from 'src/entities/core.entity';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';

export enum OrderDetailStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export const CHECK_VALID_ORDER_DETAIL_TOTAL_AMOUNT_CONSTRAINT =
  'chk_valid_order_detail_total_amount_constraint';

@Entity({ name: 'order_details' })
@Check(CHECK_VALID_ORDER_DETAIL_TOTAL_AMOUNT_CONSTRAINT, '"total_amount" >= 0')
export class OrderDetail extends CoreEntity {
  constructor(partial: Partial<OrderDetail>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.orders, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: OrderDetailStatus,
    default: OrderDetailStatus.PENDING,
  })
  status: OrderDetailStatus;

  @OneToOne(() => Payment, (p) => p.order, {
    onDelete: 'RESTRICT',
  })
  payment: Payment;

  @Column({
    type: 'bigint',
    default: 0,
    name: 'total_amount',
    transformer: bigintTransformer,
  })
  totalAmount: string;

  @Column({
    type: 'char',
    length: 3,
  })
  currency: string;

  @OneToMany(() => OrderItem, (o) => o.order, {
    cascade: ['insert', 'update'],
  })
  items: OrderItem[];

  // Customer + address snapshot
  @Column({
    type: 'varchar',
    length: 100,
    name: 'customer_first_name',
  })
  customerFirstName: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'customer_last_name',
  })
  customerLastName: string;

  @Column({
    type: 'varchar',
    length: 12,
    name: 'customer_phone_number',
  })
  customerPhoneNumber: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'customer_email',
  })
  customerEmail: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'customer_address_line_1',
  })
  customerAddressLine1: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'customer_address_line_2',
    nullable: true,
  })
  customerAddressLine2: string | null;

  @Column({
    type: 'varchar',
    length: 2,
    name: 'customer_country',
  })
  customerCountry: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'customer_city',
  })
  customerCity: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'customer_postal_code',
  })
  customerPostalCode: string;
}
