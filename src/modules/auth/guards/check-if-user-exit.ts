import { Injectable, CanActivate, ExecutionContext, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CheckIfUserExit implements CanActivate {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const email = request.body.email;

        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            throw new ConflictException('User already exists');
        }

        return true;
    }
}
