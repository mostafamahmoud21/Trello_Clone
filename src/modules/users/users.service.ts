import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Projects } from '../projects/entities/project.entity';
import { UpdateUserDto } from './dto/update.user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Projects) private projectRepository: Repository<Projects>
    ) {}

    /**
     * Retrieves a user by their ID.
     * 
     * @param id - The ID of the user to retrieve.
     * @param userId - The ID of the currently authenticated user.
     * @returns The user information.
     * @throws NotFoundException - If the user is not found.
     * @throws ForbiddenException - If the user is not authorized to access the requested user.
     */
    async getUserById(id: string, userId: string) {
        const user = await this.userRepository.findOne({ where: { id: id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        if (user.id !== userId) {
            throw new ForbiddenException('You are not authorized to access this user');
        }

        return user;
    }

    /**
     * Blocks a user by their ID.
     * 
     * @param id - The ID of the user to be blocked.
     * @returns A message indicating the result of the blocking operation along with the blocked user.
     * @throws NotFoundException - If the user is not found.
     */
    async blockedUser(id: string) {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        user.isBlocked = true;
        await this.userRepository.save(user);

        return { user, message: `User blocked successfully` };
    }

    /**
     * Updates the profile of a user.
     * 
     * @param userId - The ID of the user whose profile is being updated.
     * @param body - The updated user profile details.
     * @returns A message indicating the result of the update operation along with the updated user.
     * @throws NotFoundException - If the user is not found.
     */
    async updateProfile(userId: string, body: UpdateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        
        if (body.firstName) {
            user.firstName = body.firstName;
        }
        if (body.lastName) {
            user.lastName = body.lastName;
        }
        
        await this.userRepository.save(user);

        return {
            message: 'Profile updated successfully',
            user,
        };
    }

    /**
     * Retrieves the count of projects associated with a user.
     * 
     * @param userId - The ID of the user whose project count is being retrieved.
     * @returns The count of projects associated with the user.
     * @throws NotFoundException - If no projects are found for the user.
     */
    async getUserCount(userId: string) {
        const projects = await this.projectRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['user', 'invite'],
        });

        if (!projects || projects.length === 0) {
            throw new NotFoundException(`No projects found for user with ID ${userId}`);
        }

        return { EmployeeCount: projects.length };
    }

    /**
     * Retrieves all users managed by a specific manager.
     * 
     * @param userId - The ID of the manager whose users are being retrieved.
     * @returns A list of users managed by the specified manager.
     * @throws NotFoundException - If no projects are found for the manager.
     */
    async getUsersByManager(userId: string) {
        const projects = await this.projectRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['user', 'invite'],
        });

        if (!projects || projects.length === 0) {
            throw new NotFoundException(`No projects found for user with ID ${userId}`);
        }

        return { Employee: projects };
    }
}