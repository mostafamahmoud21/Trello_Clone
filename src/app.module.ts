import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import * as path from 'path'
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '12345',
      database: 'trello',
      entities: [path.join(__dirname, '**','*.entity.{ts,js}'), ],
      synchronize: true,
    }),
    UsersModule,
    ProjectsModule,],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
