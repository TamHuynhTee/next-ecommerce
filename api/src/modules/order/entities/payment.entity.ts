import { Check, Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { OrderDetail } from './order.entity';
import { CoreEntity, bigintTransformer } from 'src/entities';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export const CHECK_VALID_PAYMENT_TOTAL_AMOUNT_CONSTRAINT =
  'chk_valid_payment_total_amount_constraint';

@Entity({ name: 'payments' })
@Check(CHECK_VALID_PAYMENT_TOTAL_AMOUNT_CONSTRAINT, '"total_amount" >= 0')
export class Payment extends CoreEntity {
  constructor(partial: Partial<Payment>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @OneToOne(() => OrderDetail, (u) => u.payment, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'order_id' })
  order: OrderDetail;

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

  @Column({ type: 'varchar', length: 100 })
  provider: string;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;
}
