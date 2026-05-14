import { Injectable } from '@nestjs/common';
import { translateDatabaseError } from '../../common/exceptions/exception-translator';
import { DatabaseService } from '../../shared/database/database.service';

export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

@Injectable()
export class PasswordResetRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    userId: number,
    token: string,
    expiresAt: Date,
  ): Promise<PasswordResetToken> {
    try {
      // Remove any existing reset token for the same user
      await this.db.query(
        'DELETE FROM password_reset_tokens WHERE user_id = $1',
        [userId],
      );

      const result = await this.db.query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3) RETURNING *`,
        [userId, token, expiresAt],
      );
      return result.rows[0] as PasswordResetToken;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM password_reset_tokens WHERE token = $1',
        [token],
      );
      return result.rows.length > 0
        ? (result.rows[0] as PasswordResetToken)
        : null;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async deleteByToken(token: string): Promise<void> {
    try {
      await this.db.query(
        'DELETE FROM password_reset_tokens WHERE token = $1',
        [token],
      );
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async deleteExpired(): Promise<void> {
    try {
      await this.db.query(
        'DELETE FROM password_reset_tokens WHERE expires_at < NOW()',
      );
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }
}
