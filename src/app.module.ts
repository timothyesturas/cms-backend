import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { MenusModule } from "./menus/menus.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProgramsModule } from './programs/programs.module';
import { SettingsModule } from "./settings/settings.module";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    MenusModule,
    ProgramsModule,
    SettingsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
