import { Injectable } from '@nestjs/common';
import { translateDatabaseError } from '../../common/exceptions/exception-translator';
import { DatabaseService } from '../../shared/database/database.service';

const MAX_ATTEMPTS_PER_DAY = 3;

@Injectable()
export class PasswordResetAttemptsRepository {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Atomically increments the daily attempt counter for the given email.
   * Returns the new count after incrementing.
   */
  async increment(email: string): Promise<number> {
    try {
      const result = await this.db.query(
        `INSERT INTO password_reset_attempts (email, attempt_date, attempt_count)
         VALUES ($1, CURRENT_DATE, 1)
         ON CONFLICT (email, attempt_date) DO UPDATE
           SET attempt_count = password_reset_attempts.attempt_count + 1
         RETURNING attempt_count`,
        [email],
      );
      return result.rows[0].attempt_count as number;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async getCountToday(email: string): Promise<number> {
    try {
      const result = await this.db.query(
        `SELECT attempt_count FROM password_reset_attempts
         WHERE email = $1 AND attempt_date = CURRENT_DATE`,
        [email],
      );
      return result.rows.length > 0
        ? (result.rows[0].attempt_count as number)
        : 0;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async deleteExpired(): Promise<void> {
    try {
      await this.db.query(
        `DELETE FROM password_reset_attempts WHERE attempt_date < CURRENT_DATE`,
      );
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  get maxAttemptsPerDay(): number {
    return MAX_ATTEMPTS_PER_DAY;
  }
}
