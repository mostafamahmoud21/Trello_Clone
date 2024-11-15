import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Projects } from './entities/project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/Create.Project.Dto';
import { User } from '../users/entities/user.entity';
import { UpdateProjectDto } from './dto/Update.Project.Dto';

@Injectable()
export class ProjectsService {
    constructor(@InjectRepository(Projects) private projectRepository: Repository<Projects>, @InjectRepository(User) private userRepository: Repository<User>,) { }

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
        return { message: 'Project deleted successfully' ,project};
    }
}
