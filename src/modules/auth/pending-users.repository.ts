import { Injectable } from '@nestjs/common';
import { translateDatabaseError } from '../../common/exceptions/exception-translator';
import { DatabaseService } from '../../shared/database/database.service';

export interface PendingUser {
  id: number;
  username: string;
  password: string;
  fullname: string;
  role: string;
  verification_token: string;
  expires_at: Date;
  created_at: Date;
}

@Injectable()
export class PendingUsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async create(
    username: string,
    password: string,
    fullname: string,
    role: string,
    verificationToken: string,
    expiresAt: Date,
  ): Promise<PendingUser> {
    try {
      // Remove any existing pending registration for the same username
      await this.db.query('DELETE FROM pending_users WHERE username = $1', [
        username,
      ]);

      const result = await this.db.query(
        `INSERT INTO pending_users (username, password, fullname, role, verification_token, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [username, password, fullname, role, verificationToken, expiresAt],
      );
      return result.rows[0] as PendingUser;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async findByToken(token: string): Promise<PendingUser | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM pending_users WHERE verification_token = $1',
        [token],
      );
      return result.rows.length > 0 ? (result.rows[0] as PendingUser) : null;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async deleteByToken(token: string): Promise<void> {
    try {
      await this.db.query(
        'DELETE FROM pending_users WHERE verification_token = $1',
        [token],
      );
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async deleteExpired(): Promise<void> {
    try {
      await this.db.query('DELETE FROM pending_users WHERE expires_at < NOW()');
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }
}
