import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Roles } from '../auth/enums/role.enum';
import { throwIfEmpty } from 'rxjs';
import { UpdateUserDto } from './dto/update.user.dto';
import { Projects } from '../projects/entities/project.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Projects) private projectRepository: Repository<Projects>
    ) { }

    async getUserById(id: string, userId: string) {

        const user = await this.userRepository.findOne({ where: { id: id } });

        // If user is not found, throw a NotFoundException
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Check if the user is trying to access their own data or if they are a manager
        if (user.id !== userId) {
            throw new ForbiddenException('You are not authorized to access this user');
        }

        return user;
    }

    async blockedUser(id: string) {
        const user = await this.userRepository.findOne({ where: { id } })

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        user.isBlocked = true
        await this.userRepository.save(user)

        return { user, message: `user Blocked success` }
    }

    async updateProfile(userId: string, body: UpdateUserDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
        if (body.firstName) {
            user.firstName = body.firstName
        }
        if (body.lastName) {
            user.lastName = body.lastName
        }
        await this.userRepository.save(user);

        return {
            message: 'Profile updated successfully',
            user,
        };

    }

    async getUserCount(userId: string) {
        const Employee = await this.projectRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['user', 'invite'],
        });

        if (!Employee || Employee.length === 0) {
            throw new NotFoundException(`No projects found for user with ID ${userId}`);
        }

        return { EmployeeCount: Employee.length };
    }

    async getUsersByManager(userId: string) {
        const Employee = await this.projectRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['user', 'invite'],
        });

        if (!Employee || Employee.length === 0) {
            throw new NotFoundException(`No projects found for user with ID ${userId}`);
        }

        return { Employee };
    }

}
