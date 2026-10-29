import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  NavigationService,
  type CreateNavigationDto,
  type UpdateNavigationDto,
} from './navigation.service';

@Controller('api/navigation')
export class NavigationController {
  constructor(
    private readonly navigationService: NavigationService,
  ) {}

  // GET /api/navigation
  // Admin: retrieve all navigation records.
  @Get()
  findAll() {
    return this.navigationService.findAll();
  }

  // GET /api/navigation/public
  // Public website: retrieve active and enabled items.
  @Get('public')
  findPublic() {
    return this.navigationService.findPublic();
  }

  // POST /api/navigation
  // Create a navigation item.
  @Post()
  create(@Body() body: CreateNavigationDto) {
    return this.navigationService.create(body);
  }

  // PATCH /api/navigation/:id
  // Update a navigation item.
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateNavigationDto,
  ) {
    return this.navigationService.update(id, body);
  }

  // DELETE /api/navigation/:id
  // Soft-delete: mark the record inactive.
  @Delete(':id')
  deactivate(@Param('id') id: string) {
    return this.navigationService.deactivate(id);
  }
}