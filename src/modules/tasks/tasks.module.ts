import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from './entities/task.entity';
import { Projects } from '../projects/entities/project.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../auth/strategies/Jwt.Strategy';
import { User } from '../users/entities/user.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Task,Projects,User])],
  controllers: [TasksController],
  providers: [TasksService,JwtStrategy,JwtAuthGuard],
})
export class TasksModule {}
