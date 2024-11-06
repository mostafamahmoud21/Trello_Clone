import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
async function bootstrap() {

  dotenv.config();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }
  ))

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
