import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { JwtStrategy } from '../auth/strategies/Jwt.Strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Projects } from '../projects/entities/project.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User,Projects])],
  controllers: [UsersController],
  providers: [UsersService,JwtStrategy,JwtAuthGuard],
})
export class UsersModule {}
