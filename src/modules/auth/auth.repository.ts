import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { translateDatabaseError } from '../../common/exceptions/exception-translator';

export interface ApiToken {
  user_id: number;
  token: string;
  device_type: string;
  expired_at: Date | null;
  created_at: Date;
}

@Injectable()
export class AuthRepository {
  constructor(private readonly db: DatabaseService) {}

  async saveToken(
    user_id: number,
    token: string,
    device_type: string,
    expiredAt: Date | null,
  ): Promise<ApiToken> {
    try {
      const result = await this.db.query(
        `INSERT INTO api_tokens (user_id, token, device_type, expired_at)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, device_type) DO UPDATE 
         SET token = EXCLUDED.token, expired_at = EXCLUDED.expired_at
         RETURNING *`,
        [user_id, token, device_type, expiredAt],
      );
      return result.rows[0] as ApiToken;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async getToken(user_id: number, device_type: string): Promise<ApiToken | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM api_tokens WHERE user_id = $1 AND device_type = $2',
        [user_id, device_type],
      );
      return result.rows.length > 0 ? (result.rows[0] as ApiToken) : null;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async deleteToken(user_id: number, device_type: string): Promise<void> {
    try {
      await this.db.query(
        'DELETE FROM api_tokens WHERE user_id = $1 AND device_type = $2',
        [user_id, device_type],
      );
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }
}
