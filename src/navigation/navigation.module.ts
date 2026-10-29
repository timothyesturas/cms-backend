import { Module } from '@nestjs/common';

import { DatabaseModule } from '../database/database.module';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';

@Module({
  imports: [DatabaseModule],
  controllers: [NavigationController],
  providers: [NavigationService],
})
export class NavigationModule {}