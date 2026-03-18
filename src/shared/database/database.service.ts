import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT) || 5432,
      database: process.env.PGDATABASE || 'postgres',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
    });
  }

  getPool(): Pool {
    return this.pool;
  }

  async query(text: string, params?: unknown[]): Promise<QueryResult> {
    return this.pool.query(text, params);
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }
}
