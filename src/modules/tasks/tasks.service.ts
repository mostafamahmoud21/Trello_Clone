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
    ) {}

    /**
     * Creates a new task for a specified project.
     * 
     * @param body - The details of the task to be created.
     * @param userId - The ID of the user creating the task.
     * @param projectId - The ID of the project to which the task belongs.
     * @returns A message indicating the result of the creation process along with the created task.
     * @throws NotFoundException - If the project is not found.
     * @throws ForbiddenException - If the user is not authorized to access the project.
     */
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

    /**
     * Updates an existing task.
     * 
     * @param taskId - The ID of the task to be updated.
     * @param userId - The ID of the user updating the task.
     * @param body - The updated task details.
     * @returns A message indicating the result of the update process along with the updated task.
     * @throws NotFoundException - If the task is not found.
     * @throws ForbiddenException - If the user is not authorized to update the task.
     */
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

    /**
     * Deletes a task by its ID.
     * 
     * @param taskId - The ID of the task to be deleted.
     * @param userId - The ID of the user requesting the deletion.
     * @returns A message indicating the result of the deletion process.
     * @throws NotFoundException - If the task is not found.
     * @throws ForbiddenException - If the user is not authorized to delete the task.
     */
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

    /**
     * Assigns a task to a user.
     * 
     * @param taskId - The ID of the task to be assigned.
     * @param userId - The ID of the user assigning the task.
     * @param body - The details of the user to whom the task is assigned.
     * @param projectId - The ID of the project to which the task belongs.
     * @returns A message indicating the result of the assignment process along with the assigned task.
     * @throws NotFoundException - If the task, user, or project is not found.
     * @throws ForbiddenException - If the user is not authorized to assign tasks in the project.
     */
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
            throw new NotFoundException('Project not found or no invite for this email');
        }

        task.assignedUser = user;

        await this.taskRepository.save(task);

        const emailSubject = `Task Assigned: ${task.name}`;
        const emailText = `Hello ${user.firstName},\n\nYou have been assigned a new task in the project "${project.name}".\n\nTask Details:\n- Task: ${task.name}\n- Project: ${project.name}\n\nPlease check your tasks and start working on it.\n\nBest regards,\nYour Team`;

        await this.mailService.sendMail(user.email, emailSubject, emailText);

        return { message: 'Task assigned successfully and email sent', task };
    }

    /**
     * Retrieves all tasks assigned to a user for a specific project.
     * 
     * @param projectId - The ID of the project.
     * @param userId - The ID of the user whose assigned tasks are being retrieved.
     * @returns A list of assigned tasks.
     * @throws NotFoundException - If no tasks are found for the current user.
     */
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

    /**
     * Retrieves all tasks for a specific project.
     * 
     * @param projectId - The ID of the project.
     * @param userId - The ID of the user requesting the tasks.
     * @returns A list of all tasks in the specified project.
     */
    async getAllTasks(projectId: string, userId: string) {
        const project = await this.projectRepository.findOne({
            where: { id: projectId },
            relations: ['user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if user is authorized to view tasks
        if (project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to view tasks for this project');
        }

        const tasks = await this.taskRepository.find({
            where: { project: { id: projectId } },
            relations: ['project'],
        });

        return { message: 'All Tasks retrieved successfully', tasks };
    }

    /**
     * Retrieves a specific task by its ID.
     * 
     * @param taskId - The ID of the task to retrieve.
     * @param userId - The ID of the user requesting the task.
     * @returns The requested task.
     * @throws NotFoundException - If the task is not found.
     * @throws ForbiddenException - If the user is not authorized to view the task.
     */
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

    /**
     * Retrieves the count of tasks assigned to a specific user within a project.
     * 
     * @param projectId - The ID of the project.
     * @param userId - The ID of the user whose task count is being retrieved.
     * @returns The count of assigned tasks.
     * @throws NotFoundException - If no tasks are found for the current user.
     */
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

    /**
     * Changes the status of a specific task.
     * 
     * @param taskId - The ID of the task whose status is being changed.
     * @param userId - The ID of the user requesting the status change.
     * @param body - The new status details.
     * @returns A message indicating the result of the status change process along with the updated task.
     * @throws NotFoundException - If the task is not found.
     * @throws ForbiddenException - If the user is not authorized to change the task status.
     */
    async changeStatus(taskId: string, userId: string, body: ChangeStatusDto) {
        const task = await this.taskRepository.findOne({
            where: { id: taskId },
            relations: ['project', 'project.user', 'assignedUser'],
        });

        if (!task) {
            throw new NotFoundException('Task not found');
        }

        if (!task.assignedUser || task.assignedUser.id !== userId) {
            throw new ForbiddenException('You are not authorized to change the status of this task');
        }

        task.status = body.status;
        await this.taskRepository.save(task);

        return { message: 'Task status updated successfully', task };
    }
}