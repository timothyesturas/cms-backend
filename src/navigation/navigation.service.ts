import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

export type CreateNavigationDto = {
  name: string;
  path: string;
  sortOrder: number;
  isEnabled?: boolean;
  userId?: string | null;
};

export type UpdateNavigationDto = {
  name?: string;
  path?: string;
  sortOrder?: number;
  isActive?: boolean;
  isEnabled?: boolean;
  userId?: string | null;
};

@Injectable()
export class NavigationService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  // Retrieve all records for the admin page.
  async findAll() {
    const sql = `
      SELECT
        id,
        name,
        path,
        user_id AS "userId",
        is_active AS "isActive",
        is_enabled AS "isEnabled",
        sort_order AS "sortOrder",
        created_by AS "createdBy",
        created_on AS "createdOn",
        updated_by AS "updatedBy",
        updated_on AS "updatedOn"
      FROM public.navigation
      ORDER BY sort_order ASC, created_on DESC
    `;

    const result = await this.databaseService.query(sql);

    return result.rows;
  }

  // Retrieve only navigation items visible on the public website.
  async findPublic() {
    const sql = `
      SELECT
        id,
        name,
        path,
        sort_order AS "sortOrder"
      FROM public.navigation
      WHERE is_active = TRUE
        AND is_enabled = TRUE
      ORDER BY sort_order ASC, name ASC
    `;

    const result = await this.databaseService.query(sql);

    return result.rows;
  }

  // Create a navigation item.
  async create(data: CreateNavigationDto) {
    this.validateNavigation(data.name, data.path, data.sortOrder);

    const sql = `
      INSERT INTO public.navigation (
        name,
        path,
        user_id,
        is_enabled,
        sort_order
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        name,
        path,
        user_id AS "userId",
        is_active AS "isActive",
        is_enabled AS "isEnabled",
        sort_order AS "sortOrder",
        created_by AS "createdBy",
        created_on AS "createdOn",
        updated_by AS "updatedBy",
        updated_on AS "updatedOn"
    `;

    const result = await this.databaseService.query(sql, [
      data.name.trim(),
      data.path.trim(),
      data.userId ?? null,
      data.isEnabled ?? true,
      data.sortOrder ?? 0,
    ]);

    return result.rows[0];
  }

  // Update an existing navigation item.
  async update(id: string, data: UpdateNavigationDto) {
    const existingResult = await this.databaseService.query(
      `SELECT id FROM public.navigation WHERE id = $1`,
      [id],
    );

    if (existingResult.rows.length === 0) {
      throw new NotFoundException('Navigation item not found.');
    }

    if (
      data.name !== undefined ||
      data.path !== undefined ||
      data.sortOrder !== undefined
    ) {
      if (
        data.name === undefined ||
        data.path === undefined ||
        data.sortOrder === undefined
      ) {
        const currentResult = await this.databaseService.query(
          `
            SELECT
              name,
              path,
              sort_order AS "sortOrder"
            FROM public.navigation
            WHERE id = $1
          `,
          [id],
        );

        const current = currentResult.rows[0];

        this.validateNavigation(
          data.name ?? current.name,
          data.path ?? current.path,
          data.sortOrder ?? current.sortOrder,
        );
      } else {
        this.validateNavigation(
          data.name,
          data.path,
          data.sortOrder,
        );
      }
    }

    const sql = `
      UPDATE public.navigation
      SET
        name = COALESCE($2, name),
        path = COALESCE($3, path),
        sort_order = COALESCE($4, sort_order),
        is_active = COALESCE($5, is_active),
        is_enabled = COALESCE($6, is_enabled),
        user_id = CASE
          WHEN $7::boolean THEN $8::varchar
          ELSE user_id
        END,
        updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING
        id,
        name,
        path,
        user_id AS "userId",
        is_active AS "isActive",
        is_enabled AS "isEnabled",
        sort_order AS "sortOrder",
        created_by AS "createdBy",
        created_on AS "createdOn",
        updated_by AS "updatedBy",
        updated_on AS "updatedOn"
    `;

    const result = await this.databaseService.query(sql, [
      id,
      data.name === undefined ? null : data.name.trim(),
      data.path === undefined ? null : data.path.trim(),
      data.sortOrder ?? null,
      data.isActive ?? null,
      data.isEnabled ?? null,
      data.userId !== undefined,
      data.userId ?? null,
    ]);

    return result.rows[0];
  }

  // Deactivate a record instead of physically deleting it.
  async deactivate(id: string) {
    const sql = `
      UPDATE public.navigation
      SET
        is_active = FALSE,
        updated_on = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, name, path, is_active AS "isActive"
    `;

    const result = await this.databaseService.query(sql, [id]);

    if (result.rows.length === 0) {
      throw new NotFoundException('Navigation item not found.');
    }

    return result.rows[0];
  }

  private validateNavigation(
    name: string,
    path: string,
    sortOrder: number,
  ) {
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      name.trim().length > 100
    ) {
      throw new BadRequestException(
        'Navigation name is required and must not exceed 100 characters.',
      );
    }

    if (
      typeof path !== 'string' ||
      !path.trim() ||
      path.trim().length > 255
    ) {
      throw new BadRequestException(
        'Navigation path is required and must not exceed 255 characters.',
      );
    }

    if (
      typeof sortOrder !== 'number' ||
      !Number.isInteger(sortOrder)
    ) {
      throw new BadRequestException(
        'Sort order must be an integer.',
      );
    }
  }
}