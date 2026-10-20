
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export type UpdateSettingsDto = {
  siteName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
};

@Injectable()
export class SettingsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async findOne() {
    const sql = `
      SELECT
        site_name AS "siteName",
        tagline,
        primary_color AS "primaryColor",
        secondary_color AS "secondaryColor",
        background_color AS "backgroundColor",
        updated_at AS "updatedAt"
      FROM site_settings
      WHERE id = 1
    `;

    const result = await this.databaseService.query(sql);

    if (result.rows.length === 0) {
      throw new Error(
        'Website settings were not initialized. Run the settings table SQL first.',
      );
    }

    return result.rows[0];
  }

  async update(settings: UpdateSettingsDto) {
    this.validateSettings(settings);

    const sql = `
      INSERT INTO site_settings (
        id,
        site_name,
        tagline,
        primary_color,
        secondary_color,
        background_color,
        updated_at
      )
      VALUES (1, $1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      ON CONFLICT (id)
      DO UPDATE SET
        site_name = EXCLUDED.site_name,
        tagline = EXCLUDED.tagline,
        primary_color = EXCLUDED.primary_color,
        secondary_color = EXCLUDED.secondary_color,
        background_color = EXCLUDED.background_color,
        updated_at = CURRENT_TIMESTAMP
      RETURNING
        site_name AS "siteName",
        tagline,
        primary_color AS "primaryColor",
        secondary_color AS "secondaryColor",
        background_color AS "backgroundColor",
        updated_at AS "updatedAt"
    `;

    const result = await this.databaseService.query(sql, [
      settings.siteName.trim(),
      settings.tagline.trim(),
      settings.primaryColor,
      settings.secondaryColor,
      settings.backgroundColor,
    ]);

    return result.rows[0];
  }

  private validateSettings(settings: UpdateSettingsDto) {
    if (
      typeof settings.siteName !== 'string' ||
      !settings.siteName.trim() ||
      settings.siteName.trim().length > 150
    ) {
      throw new BadRequestException(
        'Website name is required and must be at most 150 characters.',
      );
    }

    if (
      typeof settings.tagline !== 'string' ||
      settings.tagline.length > 255
    ) {
      throw new BadRequestException(
        'Tagline must be at most 255 characters.',
      );
    }

    const colors = [
      settings.primaryColor,
      settings.secondaryColor,
      settings.backgroundColor,
    ];

    if (
      colors.some(
        (color) =>
          typeof color !== 'string' ||
          !/^#[0-9a-fA-F]{6}$/.test(color),
      )
    ) {
      throw new BadRequestException(
        'Each color must be a valid six-digit hexadecimal color.',
      );
    }
  }
}
