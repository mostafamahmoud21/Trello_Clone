import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from '../mail.service';
import { JwtStrategy } from './strategies/Jwt.Strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { GoogleAuthentication } from './strategies/google.strategy';
import { GithubAuthentication } from './strategies/github.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRES_IN')},
      }),
    }),
  ], 
   controllers: [AuthController],
  providers: [AuthService,MailService,JwtStrategy,JwtAuthGuard,GoogleAuthentication,GithubAuthentication], 
})
export class AuthModule {}
