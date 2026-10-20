
import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService implements OnModuleInit {
  constructor(private readonly databaseService: DatabaseService) {}

  async onModuleInit() {
    await this.databaseService.query('SELECT 1');
    console.log('PostgreSQL connection successful!');
  }

  getHello(): string {
    return 'NestJS backend is running!';
  }
}
