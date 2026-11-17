import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ERROR_CODE, POSTGRES_ERROR_CODE } from '../constants/error-code';

/**
 * Translate known Postgres constraint violations into HTTP 409 responses.
 * Unknown errors are rethrown untouched.
 */
export function rethrowDbError(error: unknown): never {
  if (error instanceof QueryFailedError) {
    const code = error.driverError?.code;
    const constraint: string = error.driverError?.constraint ?? '';
    if (code === POSTGRES_ERROR_CODE.UNIQUE_VIOLATION) {
      if (constraint.includes('sku')) {
        throw new ConflictException(ERROR_CODE.SKU_EXISTED);
      }
      throw new ConflictException(ERROR_CODE.SLUG_EXISTED);
    }
    if (code === POSTGRES_ERROR_CODE.FOREIGN_KEY_VIOLATION) {
      throw new ConflictException('RESOURCE_IN_USE');
    }
  }
  throw error;
}
