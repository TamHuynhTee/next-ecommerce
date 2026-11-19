import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { STRONG_PASSWORD } from './sign-up.dto';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsStrongPassword(STRONG_PASSWORD)
  newPassword: string;

  /** The caller's own refresh token, so that session stays signed in. */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
