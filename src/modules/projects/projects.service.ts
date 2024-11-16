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
    ) { }

    async createNewProject(userId: string, body: CreateProjectDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new Error('User not found');
        }

        const newProject = this.projectRepository.create({
            name: body.name,
            description: body.description,
            user,
        });

        const project = await this.projectRepository.save(newProject);

        return { message: 'Project created successfully', project }
    }

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

    async inviteUser(id: string, userId: string, body: InviteUserProjectDto) {
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

        const user = await this.userRepository.findOne({
            where: {
                email: body.email
            }
        })
        if (!user) {
            throw new Error('User not found');
        }
        const joinLink = `${process.env.CLIENT_URL}/api/projects/Accept-Invite/${project.id}`; // Use env variable for the host
        await this.mailService.sendMail(
            user.email,
            `Your Manager ${project.user.firstName} ${project.user.lastName} has invited you to join the project`,
            `Click here to accept the invitation: ${joinLink}`,
        );
        return { message: "The invitation has been sent" }
    }

    async acceptInvite(id: string, userId: string) {
        const project = await this.projectRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }
        const user = await this.userRepository.findOne({ where: { id: userId } });

        project.invite = user
        await this.projectRepository.save(project)
        return { message: "You Are Join Success", project }
    }

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

    async getEmployeeProjects(userId: string) {
        const projects = await this.projectRepository.find({
            where: { invite: { id: userId } },
            relations: ['invite'],
        });

        if (!projects.length) {
            throw new NotFoundException('No projects found for this manager.');
        }

        return {
            message: 'No projects found for this employee.',
            projects,
        };
    }

}
