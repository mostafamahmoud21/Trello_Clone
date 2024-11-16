import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create.task.dto';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/role.guard';
import { Role } from '../auth/decorators/role.decorator';
import { Roles } from '../auth/enums/role.enum';
import { User } from '../auth/types/express';
import { ChangeStatusDto, UpdateTaskDto } from './dto/update.task.dto';
import { AssignedTasksDto } from './dto/assigned.task.dto';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post('create-task/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  createTask(@Body() body: CreateTaskDto, @Req() req: Request, @Param('projectId') projectId: string) {
    const userId = (req.user as User).id;
    return this.tasksService.createTask(body, userId, projectId)
  }

  @Patch(':taskId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  updateTask(
    @Param('taskId') taskId: string,
    @Req() req: Request,
    @Body() body: UpdateTaskDto,
  ) {
    const userId = (req.user as User).id;
    return this.tasksService.updateTask(taskId, userId, body);
  }

  @Delete(':taskId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  deleteTask(@Param('taskId') taskId: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.tasksService.deleteTask(taskId, userId);
  }

  @Post('assign-task/:projectId/:taskId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  assignedTasks(
    @Param('projectId') projectId: string,
    @Param('taskId') taskId: string,
    @Req() req: Request,
    @Body() body: AssignedTasksDto,
  ) {
    const userId = (req.user as User).id;
    return this.tasksService.assignedTasks(taskId, userId, body, projectId);
  }

  @Get('get-assigned-tasks/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getAssignedTasks(@Param('projectId') projectId: string, @Req() req: Request,) {
    const userId = (req.user as User).id;
    return this.tasksService.getAssignedTasks(projectId, userId);
  }

  @Get('All-Tasks/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER,Roles.Manager)
  getAllTasks(@Param('projectId') projectId: string, @Req() req: Request,) {
    const userId = (req.user as User).id;
    return this.tasksService.getAllTasks(projectId, userId);
  }


  @Get(':taskId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getTaskById(@Param('taskId') taskId: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.tasksService.getTaskById(taskId, userId);
  }

  @Get('get-assigned-tasks/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getTaskCount(@Param('projectId') projectId: string, @Req() req: Request,) {
    const userId = (req.user as User).id;
    return this.tasksService.getTaskCount(projectId, userId);
  }
  @Patch('change-status/:taskId') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER)
  changeStatus(@Param('taskId') taskId: string, @Req() req: Request,@Body() body: ChangeStatusDto){
    const userId = (req.user as User).id;
    return this.tasksService.changeStatus(taskId,userId,body)
  }

  
}
