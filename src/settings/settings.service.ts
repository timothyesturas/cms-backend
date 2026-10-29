
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateSettingsDto } from './UpdateSettingsDto';



@Injectable()
export class SettingsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) { }

  async findOne() {
    const sql = `
      SELECT
        site_name AS "siteName",
        tagline,
        primary_color AS "primaryColor",
        slogan1,
        slogan2,
        hero_image_url AS "heroImageUrl",
        logo_url AS "logoUrl",
        updated_at AS "updatedAt"
      FROM site_settings
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
    UPDATE site_settings
    SET
      site_name = $1,
      tagline = $2,
      primary_color = $3,
      slogan1 = $4,
      slogan2 = $5,
      hero_image_url = $6,
      logo_url = $7,
      updated_at = CURRENT_TIMESTAMP
    RETURNING
      id,
      site_name AS "siteName",
      tagline,
      primary_color AS "primaryColor",
      slogan1,
      slogan2,
      hero_image_url AS "heroImageUrl",
      logo_url AS "logoUrl",
      updated_at AS "updatedAt"
  `;

    const result = await this.databaseService.query(sql, [
      settings.siteName.trim(),
      settings.tagline.trim(),
      settings.primaryColor,
      settings.slogan1.trim(),
      settings.slogan2.trim(),
      settings.heroImageUrl,
      settings.logoUrl,
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
