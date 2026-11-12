import { CoreEntity } from 'src/entities/core.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'addresses' })
export class Address extends CoreEntity {
  constructor(partial: Partial<Address>) {
    super();
    Object.assign(this, partial);
  }

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (u) => u.addresses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'varchar',
    length: 100,
  })
  title: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'address_line_1',
  })
  addressLine1: string;

  @Column({
    type: 'varchar',
    length: 500,
    name: 'address_line_2',
    nullable: true,
  })
  addressLine2: string | null;

  @Column({
    type: 'varchar',
    length: 2,
  })
  country: string; // ISO 3166-1 Alpha-2

  @Column({
    type: 'varchar',
    length: 100,
  })
  city: string;

  @Column({
    type: 'varchar',
    length: 20,
    name: 'postal_code',
  })
  postalCode: string;

  @Column({
    type: 'varchar',
    length: 12,
    name: 'phone_number',
  })
  phoneNumber: string;
}
