import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import * as path from 'path'
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [path.join(__dirname, '**', '*.entity.{ts,js}'),],
      synchronize: true,
    }),
    UsersModule,
    ProjectsModule,
    AuthModule,],
  controllers: [],
  providers: [],
})
export class AppModule { }
