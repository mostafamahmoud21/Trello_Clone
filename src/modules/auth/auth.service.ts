import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto, VerifyEmailDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail.service'
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/password.management';
import * as bcrypt from 'bcrypt'
import { Roles } from './enums/role.enum';
Roles
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    async register(body: RegisterDto) {
        try {
            const user = this.userRepository.create({...body,role:Roles.USER});
            const saveUser = await this.userRepository.save(user);
            await this.mailService.sendMail(user.email, 'Email Verification', `Your verification code is: ${user.verficationCode}`);
            const { password, ...userWithoutPassword } = saveUser;
            return { message: 'User registered successfully , please check your email for verification' };
        } catch (error) {
            throw new InternalServerErrorException('Failed to register user');
        }
    }

    async registerManager(body: RegisterDto) {
        try {
          const user = this.userRepository.create({ ...body, role: Roles.Manager });
          const saveUser = await this.userRepository.save(user);
          await this.mailService.sendMail(user.email, 'Email Verification', `Your verification code is: ${user.verficationCode}`);
          return { message: 'Manager registered successfully, please check your email for verification' };
        } catch (error) {
          throw new InternalServerErrorException('Failed to register manager');
        }
      }

    async verify(body: VerifyEmailDto) {
        const user = await this.userRepository.findOne({
            where: { email: body.email, verficationCode: body.verificationCode }
        })

        if (!user) {
            throw new UnauthorizedException('Invalid email or verification code');
        }

        user.isVerified = true;
        user.verficationCode = null
        await this.userRepository.save(user)

        return { message: 'Your email has been verified! You may now log in to your account.' }
    }

    async login(body: LoginDto) {
        const { email, password } = body;

        const user = await this.userRepository.findOne({ where: { email } });

        if (!user) {
            throw new UnauthorizedException('Invalid email or password');
        }

        const isPasswordValid = await user.comparePassword(password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid email or password');
        }

        if (!user.isVerified) {
            throw new UnauthorizedException('Please verify your email before logging in.');
        }

        const payload = {
            id: user.id,
            email: user.email,
            role:user.role
        };

        const accessToken = this.jwtService.sign(payload);
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken };
    }

    async forgetPassword(body: ForgotPasswordDto) {
        const user = await this.userRepository.findOne({ where: { email: body.email } });

        if (!user) {
            throw new UnauthorizedException('Invalid email');
        }

        user.verficationCode = Math.floor(100000 + Math.random() * 900000);

        try {
            await this.userRepository.save(user);

            await this.mailService.sendMail(
                user.email,
                'Password Reset Verification',
                `Your password reset verification code is: ${user.verficationCode}`
            );

            return { message: 'A verification code has been sent to your email address. Please check your email to proceed with password reset.' };
        } catch (error) {
            throw new InternalServerErrorException('Failed to process password reset request');
        }
    }

    async resetPassword(body: ResetPasswordDto) {
        const user = await this.userRepository.findOne({ where: { email: body.email, verficationCode: body.verificationCode } });

        if (!user) {
            throw new UnauthorizedException('Invalid email or code');
        }

        user.password = await bcrypt.hash(body.newPassword, 10)
        user.verficationCode = null
        await this.userRepository.save(user)

        return { message: "Password reset successfully" }
    }

    async changePassword(userId: string, body: ChangePasswordDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        console.log(user)
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        const isCurrentPasswordValid = await user.comparePassword(body.currentPassword);

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        user.password = await bcrypt.hash(body.newPassword, 10);
        await this.userRepository.save(user);

        return { message: 'Password changed successfully' };
    }

    async googleCallback(googleProfile: any) {
        const { email, firstName, lastName } = googleProfile
        let user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            user = this.userRepository.create({
                email,
                firstName,
                lastName,
                isVerified: true,
            });
            await this.userRepository.save(user);
        }
        const payload = {
            id: user.id,
            email: user.email,
        };
        const accessToken = this.jwtService.sign(payload);
        return { Profile: user, accessToken };
    }

    async githubCallback(githubProfile: any) {
        const { email, firstName, lastName } = githubProfile
        let user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            user = this.userRepository.create({
                email,
                firstName,
                lastName,
                isVerified: true,
            });
            await this.userRepository.save(user);
        }
        const payload = {
            id: user.id,
            email: user.email,
        };
        const accessToken = this.jwtService.sign(payload);
        return { Profile: user, accessToken };
    }
}
