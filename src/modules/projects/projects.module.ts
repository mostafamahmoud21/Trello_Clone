import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { JwtStrategy } from '../auth/strategies/Jwt.Strategy';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Projects } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail.service';

@Module({
  imports:[TypeOrmModule.forFeature([Projects,User])],
  controllers: [ProjectsController],
  providers: [ProjectsService,JwtStrategy,JwtAuthGuard,MailService],
})
export class ProjectsModule {}
