import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

export interface DatabaseError {
  code?: string;
  detail?: string;
  constraint?: string;
}

export function translateDatabaseError(error: unknown): Error {
  const err = error as DatabaseError;

  if (err && typeof err === 'object' && 'code' in err) {
    switch (err.code) {
      case '23505': // Unique violation
        return new ConflictException('Resource already exists');
      case '23503': // Foreign key violation
        return new BadRequestException('Related resource not found');
      case '23502': // NOT NULL violation
        return new BadRequestException('Missing required field');
      default:
        return new InternalServerErrorException('Database error occurred');
    }
  }

  if (error instanceof Error) {
    return error;
  }

  return new InternalServerErrorException('Unknown error occurred');
}
