
import {
  Body,
  Controller,
  Get,
  Put,
} from '@nestjs/common';

import { SettingsService } from './settings.service';
import type { UpdateSettingsDto } from './settings.service';

@Controller('api/settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
  ) {}

  @Get()
  findOne() {
    return this.settingsService.findOne();
  }

  @Put()
  update(@Body() body: UpdateSettingsDto) {
    return this.settingsService.update(body);
  }
}
