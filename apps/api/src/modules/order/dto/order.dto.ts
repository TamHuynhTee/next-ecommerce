import { Type } from 'class-transformer';
import {
  IsEnum,
  IsEmail,
  IsInt,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { OrderDetailStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName: string;

  /** Stored in a 12 character column. */
  @Matches(/^\+?\d{9,11}$/, { message: 'phone must be 9-11 digits' })
  phone: string;

  @IsEmail()
  @MaxLength(100)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  addressLine1: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  addressLine2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  postalCode: string;

  @IsOptional()
  @IsISO31661Alpha2()
  country?: string;
}

export class ListOrdersDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(OrderDetailStatus)
  status?: OrderDetailStatus;

  /** Admin search: order id, customer name or email. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderDetailStatus)
  status: OrderDetailStatus;
}
