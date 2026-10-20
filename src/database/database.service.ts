
import {
  Inject,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import { Pool } from 'pg';
import { DATABASE_POOL } from './database.constants';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  constructor(
    @Inject(DATABASE_POOL)
    private readonly pool: Pool,
  ) {}

  async query(sql: string, params: any[] = []) {
    return this.pool.query(sql, params);
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
