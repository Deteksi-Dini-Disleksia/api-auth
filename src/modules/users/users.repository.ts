import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { translateDatabaseError } from '../../common/exceptions/exception-translator';

export interface User {
  user_id: number;
  username: string;
  password: string;
  fullname: string;
  role: string;
  created_at: Date;
}

@Injectable()
export class UsersRepository {
  constructor(private readonly db: DatabaseService) {}

  async findByUsername(username: string): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE username = $1',
        [username],
      );
      return result.rows.length > 0 ? (result.rows[0] as User) : null;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async findById(user_id: number): Promise<User | null> {
    try {
      const result = await this.db.query(
        'SELECT * FROM users WHERE user_id = $1',
        [user_id],
      );
      return result.rows.length > 0 ? (result.rows[0] as User) : null;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }

  async create(
    username: string,
    password: string,
    fullname: string,
    role: string,
  ): Promise<User> {
    try {
      const result = await this.db.query(
        'INSERT INTO users (username, password, fullname, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, password, fullname, role],
      );
      return result.rows[0] as User;
    } catch (error) {
      throw translateDatabaseError(error);
    }
  }
}
