import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
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
  constructor(private readonly tasksService: TasksService) {}

  /**
   * Creates a new task within a specified project.
   * 
   * @param body - The details of the task to be created.
   * @param req - The request object containing user information.
   * @param projectId - The ID of the project to which the task belongs.
   * @returns The created task.
   */
  @Post('create-task/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  createTask(@Body() body: CreateTaskDto, @Req() req: Request, @Param('projectId') projectId: string) {
    const userId = (req.user as User).id;
    return this.tasksService.createTask(body, userId, projectId);
  }

  /**
   * Updates an existing task.
   * 
   * @param taskId - The ID of the task to be updated.
   * @param req - The request object containing user information.
   * @param body - The updated task details.
   * @returns The updated task.
   */
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

  /**
   * Deletes a task by its ID.
   * 
   * @param taskId - The ID of the task to be deleted.
   * @param req - The request object containing user information.
   * @returns A message indicating the result of the deletion.
   */
  @Delete(':taskId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.Manager)
  deleteTask(@Param('taskId') taskId: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.tasksService.deleteTask(taskId, userId);
  }

  /**
   * Assigns tasks to users within a specific project.
   * 
   * @param projectId - The ID of the project.
   * @param taskId - The ID of the task to be assigned.
   * @param req - The request object containing user information.
   * @param body - The details of the users to whom the task is assigned.
   * @returns A message indicating the result of the assignment.
   */
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

  /**
   * Retrieves all tasks assigned to the user for a specific project.
   * 
   * @param projectId - The ID of the project.
   * @param req - The request object containing user information.
   * @returns A list of assigned tasks.
   */
  @Get('get-assigned-tasks/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getAssignedTasks(@Param('projectId') projectId: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.tasksService.getAssignedTasks(projectId, userId);
  }

  /**
   * Retrieves all tasks for a specific project.
   * 
   * @param projectId - The ID of the project.
   * @param req - The request object containing user information.
   * @returns A list of all tasks in the project.
   */
  @Get('All-Tasks/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getAllTasks(@Param('projectId') projectId: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.tasksService.getAllTasks(projectId, userId);
  }

  /**
   * Retrieves a specific task by its ID.
   * 
   * @param taskId - The ID of the task to retrieve.
   * @param req - The request object containing user information.
   * @returns The requested task.
   */
  @Get(':taskId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getTaskById(@Param('taskId') taskId: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.tasksService.getTaskById(taskId, userId);
  }

  /**
   * Retrieves the count of tasks assigned to users within a project.
   * 
   * @param projectId - The ID of the project.
   * @param req - The request object containing user information.
   * @returns The count of assigned tasks.
   */
  @Get('get-assigned-tasks/:projectId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER, Roles.Manager)
  getTaskCount(@Param('projectId') projectId: string, @Req() req: Request) {
    const userId = (req.user as User).id;
    return this.tasksService.getTaskCount(projectId, userId);
  }

  /**
   * Changes the status of a specific task.
   * 
   * @param taskId - The ID of the task whose status is being changed.
   * @param req - The request object containing user information.
   * @param body - The new status details.
   * @returns A message indicating the result of the status change.
   */
  @Patch('change-status/:taskId') 
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Role(Roles.USER)
  changeStatus(@Param('taskId') taskId: string, @Req() req: Request, @Body() body: ChangeStatusDto) {
    const userId = (req.user as User).id;
    return this.tasksService.changeStatus(taskId, userId, body);
  }
}