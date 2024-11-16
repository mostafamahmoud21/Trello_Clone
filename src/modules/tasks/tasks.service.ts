import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';
import { Projects } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dto/create.task.dto';
import { ChangeStatusDto, UpdateTaskDto } from './dto/update.task.dto';
import { AssignedTasksDto } from './dto/assigned.task.dto';
import { User } from '../users/entities/user.entity';
import { MailService } from '../mail.service';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task) private taskRepository: Repository<Task>,
        @InjectRepository(Projects) private projectRepository: Repository<Projects>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private mailService: MailService
    ) { }

    async createTask(body: CreateTaskDto, userId: string, projectId: string) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to access this project');
        }

        const newTask = this.taskRepository.create({
            name: body.name,
            description: body.description,
            project,
        });

        await this.taskRepository.save(newTask);

        return { message: 'Task created successfully', task: newTask };
    }

    async updateTask(taskId: string, userId: string, body: UpdateTaskDto) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['project', 'project.user'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to update this task');
        }

        Object.assign(task, body);
        await this.taskRepository.save(task);

        return { message: 'Task updated successfully', task };
    }

    async deleteTask(taskId: string, userId: string) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['project', 'project.user'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to delete this task');
        }

        await this.taskRepository.delete(taskId);

        return { message: 'Task deleted successfully' };
    }

    async assignedTasks(taskId: string, userId: string, body: AssignedTasksDto, projectId: string) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['project', 'project.user'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (task.project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to update this task');
        }
        const user = await this.userRepository.findOne({
            where: { email: body.email }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const project = await this.projectRepository.findOne({
            where: { id: projectId, invite: user },
            relations: ['user', 'invite'],
        });

        if (!project) {
            throw new Error('Project not found or no invite for this email');
        }

        task.assignedUser = user;

        await this.taskRepository.save(task);

        const emailSubject = `Task Assigned: ${task.name}`;
        const emailText = `Hello ${user.firstName},\n\nYou have been assigned a new task in the project "${project.name}".\n\nTask Details:\n- Task: ${task.name}\n- Project: ${project.name}\n\nPlease check your tasks and start working on it.\n\nBest regards,\nYour Team`;

        await this.mailService.sendMail(user.email, emailSubject, emailText);

        return { message: 'Task assigned successfully and email sent', task };
    }

    async getAssignedTasks(projectId: string, userId: string) {
        const tasks = await this.taskRepository.find({
            where: { project: { id: projectId }, assignedUser: { id: userId } },
            relations: ['project', 'assignedUser'],
        });

        if (!tasks.length) {
            throw new NotFoundException('No tasks assigned to the current user.');
        }

        return {
            message: 'Assigned tasks retrieved successfully',
            tasks,
        };
    }

    async getAllTasks(projectId: string, userId: string) {
        const getproject = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['user'],
        });
        if (getproject.user.id !== userId) {

        }
        const tasks = await this.taskRepository.find({
            where: { project: { id: projectId } },
            relations: ['project']
        })
        return { message: 'All Tasks', tasks }
    }

    async getTaskById(taskId: string, userId: string) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['project', 'project.user', 'assignedUser'],
        });

        if (!task) {
            throw new NotFoundException('Task not found.');
        }

        if (
            task.project.user.id !== userId &&
            (!task.assignedUser || task.assignedUser.id !== userId)
        ) {
            throw new ForbiddenException('You are not authorized to view this task.');
        }

        return {
            message: 'Task retrieved successfully',
            task,
        };
    }

    async getTaskCount(projectId: string, userId: string) {
        const tasks = await this.taskRepository.find({
            where: {
                project: { id: projectId },
                assignedUser: { id: userId },
            },
            relations: ['project', 'assignedUser'],
        });

        if (tasks.length === 0) {
            throw new NotFoundException('No tasks assigned to the current user.');
        }

        return {
            message: 'Task count retrieved successfully',
            taskCount: tasks.length,
        };
    }

    async changeStatus(taskId: string, userId: string, body: ChangeStatusDto) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['project', 'project.user', 'assignedUser'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (
            (!task.assignedUser || task.assignedUser.id !== userId)
        ) {
            throw new ForbiddenException('You are not authorized to change the status of this task');
        }

        task.status = body.status;
        await this.taskRepository.save(task);

        return { message: 'Task status updated successfully', task };
    }


}
