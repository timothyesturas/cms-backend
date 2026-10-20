import { Controller, Get } from '@nestjs/common';
import { ProgramsService } from './programs.service';

@Controller('api/programs')
export class ProgramsController {
  constructor(
    private readonly programsService: ProgramsService,
  ) {}

  @Get()
  findAll() {
    return this.programsService.findAll();
  }
}