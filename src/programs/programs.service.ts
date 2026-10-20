import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ProgramsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async findAll() {
    const sql = `
      SELECT
        id,
        name,
        category,
        status,
        date_created AS "dateCreated"
      FROM programs
      WHERE is_active = 'Y'
      ORDER BY created_at DESC
    `;

    const result = await this.databaseService.query(sql);

    return result.rows;
  }
}