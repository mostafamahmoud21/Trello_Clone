import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Projects } from './entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/Create.Project.Dto';
import { User } from '../users/entities/user.entity';
import { UpdateProjectDto } from './dto/Update.Project.Dto';
import { InviteUserProjectDto } from './dto/Invite.user.dto';
import { MailService } from '../mail.service';

@Injectable()
export class ProjectsService {
    constructor(
        @InjectRepository(Projects) private projectRepository: Repository<Projects>,
        @InjectRepository(User) private userRepository: Repository<User>,
        private mailService: MailService
    ) {}

    /**
     * Creates a new project.
     * 
     * @param userId - The ID of the user creating the project.
     * @param body - The details of the project to be created.
     * @returns A message indicating the result of the creation process along with the created project.
     * @throws NotFoundException - If the user is not found.
     */
    async createNewProject(userId: string, body: CreateProjectDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const newProject = this.projectRepository.create({
            name: body.name,
            description: body.description,
            user,
        });

        const project = await this.projectRepository.save(newProject);
        return { message: 'Project created successfully', project };
    }

    /**
     * Retrieves a project by its ID.
     * 
     * @param id - The ID of the project to retrieve.
     * @param userId - The ID of the user requesting the project.
     * @returns The requested project.
     * @throws NotFoundException - If the project is not found.
     * @throws ForbiddenException - If the user is not authorized to access the project.
     */
    async getProjectById(id: string, userId: string) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to access this project');
        }

        return project;
    }

    /**
     * Updates an existing project.
     * 
     * @param id - The ID of the project to update.
     * @param userId - The ID of the user updating the project.
     * @param body - The updated project details.
     * @returns A message indicating the result of the update process along with the updated project.
     * @throws NotFoundException - If the project is not found.
     * @throws ForbiddenException - If the user is not authorized to update the project.
     */
    async updateProject(id: string, userId: string, body: UpdateProjectDto) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to update this project');
        }

        project.name = body.name;
        project.description = body.description;

        const updated = await this.projectRepository.save(project);
        return { message: 'Project updated successfully', updated };
    }

    /**
     * Deletes a project by its ID.
     * 
     * @param id - The ID of the project to delete.
     * @param userId - The ID of the user requesting the deletion.
     * @returns A message indicating the result of the deletion process along with the deleted project.
     * @throws NotFoundException - If the project is not found.
     * @throws ForbiddenException - If the user is not authorized to delete the project.
     */
    async deleteProject(id: string, userId: string) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to delete this project');
        }

        await this.projectRepository.remove(project);
        return { message: 'Project deleted successfully', project };
    }

    /**
     * Invites a user to join a project.
     * 
     * @param id - The ID of the project to which the user is invited.
     * @param userId - The ID of the user inviting someone.
     * @param body - The details of the user to invite.
     * @returns A message indicating the result of the invitation process.
     * @throws NotFoundException - If the project or user is not found.
     * @throws ForbiddenException - If the user is not authorized to invite others to the project.
     */
    async inviteUser(id: string, userId: string, body: InviteUserProjectDto) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (project.user.id !== userId) {
            throw new ForbiddenException('You are not authorized to invite users to this project');
        }

        const user = await this.userRepository.findOne({
            where: { email: body.email }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const joinLink = `${process.env.CLIENT_URL}/api/projects/Accept-Invite/${project.id}`; // Use env variable for the host
        await this.mailService.sendMail(
            user.email,
            `Your Manager ${project.user.firstName} ${project.user.lastName} has invited you to join the project`,
            `Click here to accept the invitation: ${joinLink}`,
        );
        return { message: "The invitation has been sent" };
    }

    /**
     * Accepts an invitation to join a project.
     * 
     * @param id - The ID of the project invitation.
     * @param userId - The ID of the user accepting the invitation.
     * @returns A message indicating the result of the acceptance process along with the updated project.
     * @throws NotFoundException - If the project is not found.
     */
    async acceptInvite(id: string, userId: string) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        project.invite = user;

        await this.projectRepository.save(project);
        return { message: "You have successfully joined the project", project };
    }

    /**
     * Retrieves all projects for a specific user (manager).
     * 
     * @param userId - The ID of the manager whose projects are being retrieved.
     * @returns A list of projects associated with the specified user.
     * @throws NotFoundException - If no projects are found for the user.
     */
    async getAllProjects(userId: string) {
        const projects = await this.projectRepository.find({
            where: { user: { id: userId } },
            relations: ['user'],
        });

        if (!projects.length) {
            throw new NotFoundException('No projects found for this manager.');
        }

        return {
            message: 'Projects retrieved successfully',
            projects,
        };
    }

    /**
     * Retrieves all projects associated with an employee.
     * 
     * @param userId - The ID of the employee whose projects are being retrieved.
     * @returns A list of projects associated with the specified employee.
     * @throws NotFoundException - If no projects are found for the employee.
     */
    async getEmployeeProjects(userId: string) {
        const projects = await this.projectRepository.find({
            where: { invite: { id: userId } },
            relations: ['invite'],
        });

        if (!projects.length) {
            throw new NotFoundException('No projects found for this employee.');
        }

        return {
            message: 'Projects retrieved successfully',
            projects,
        };
    }
}