import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
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
  controllers: [],
  providers: [],
})
export class AppModule {}
