
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MenusService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async findAll() {
    const sql = `
      SELECT
        m.id,
        m.label,
        m.path,
        m.icon,
        m.parent_id,
        m.sort_order,
        m.page_id,
        p.page_key,
        p.title AS page_title,
        p.page_type,
        p.data_source
      FROM menus m
      INNER JOIN pages p
        ON p.id = m.page_id
      WHERE m.is_active = 'Y'
        AND m.is_visible = TRUE
        AND p.is_active = 'Y'
      ORDER BY m.sort_order ASC
    `;

    const result = await this.databaseService.query(sql);

    return result.rows;
  }
}
