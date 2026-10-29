
import {
  BadRequestException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
  Body,
  Controller,
  Get,
  Put,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { SettingsService } from './settings.service';
import type { UpdateSettingsDto } from './UpdateSettingsDto';
const uploadDirectory = join(process.cwd(), 'uploads');

const allowedMimeTypes: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

function ensureUploadDirectory() {
  if (!existsSync(uploadDirectory)) {
    mkdirSync(uploadDirectory, { recursive: true });
  }
}

@Controller('api/settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
  ) { }

  @Get()
  findOne() {
    return this.settingsService.findOne();
  }

  @Put()
  update(@Body() body: UpdateSettingsDto) {
    return this.settingsService.update(body);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_request, _file, callback) => {
          try {
            ensureUploadDirectory();
            callback(null, uploadDirectory);
          } catch (error) {
            callback(error as Error, uploadDirectory);
          }
        },
        filename: (_request, file, callback) => {
          const extension = allowedMimeTypes[file.mimetype];

          callback(
            null,
            `${randomUUID()}${extension}`,
          );
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (_request, file, callback) => {
        if (!allowedMimeTypes[file.mimetype]) {
          callback(
            new BadRequestException(
              'Only JPG, PNG, WEBP, and GIF images are allowed.',
            ),
            false,
          );
          return;
        }

        callback(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(
        'Please select an image to upload.',
      );
    }

    return {
      url: `/api/settings/uploads/${file.filename}`,
      filename: file.filename,
    };
  }

  @Get('uploads/:filename')
  getUploadedImage(
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(filename)) {
      throw new BadRequestException('Invalid image filename.');
    }

    ensureUploadDirectory();

    return response.sendFile(filename, {
      root: uploadDirectory,
    });
  }
}
