import { PartialType } from '@nestjs/mapped-types';
import {
  IsDateString,
  IsISO31661Alpha2,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName?: string;

  /** YYYY-MM-DD. */
  @IsOptional()
  @IsDateString({ strict: true })
  dateOfBirth?: string;
}

export class CreateAddressDto {
  /** A label such as "Home" or "Office". */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

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

  /** Stored in a 12 character column. */
  @Matches(/^\+?\d{9,11}$/, { message: 'phoneNumber must be 9-11 digits' })
  phoneNumber: string;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
