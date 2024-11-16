import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { RegisterDto, VerifyEmailDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '../mail.service';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/password.management';
import * as bcrypt from 'bcrypt';
import { Roles } from './enums/role.enum';

@Injectable()
export class AuthService {
    /**
     * Constructs an instance of AuthService.
     * 
     * @param userRepository - Repository for User entity, used for database operations.
     * @param jwtService - Service for handling JSON Web Token operations.
     * @param mailService - Service for handling email sending operations.
     */
    constructor(
        @InjectRepository(User) private userRepository: Repository<User>,
        private jwtService: JwtService,
        private mailService: MailService
    ) {}

    /**
     * Registers a new user with the provided details.
     * 
     * @param body - The registration details provided by the user.
     * @returns A message indicating successful registration and prompts the user to check their email for verification.
     * @throws InternalServerErrorException - If registration fails due to a server error.
     */
    async register(body: RegisterDto) {
        try {
            const user = this.userRepository.create({ ...body, role: Roles.USER });
            const saveUser = await this.userRepository.save(user);
            await this.mailService.sendMail(user.email, 'Email Verification', `Your verification code is: ${user.verficationCode}`);
            const { password, ...userWithoutPassword } = saveUser;
            return { message: 'User registered successfully, please check your email for verification' };
        } catch (error) {
            throw new InternalServerErrorException('Failed to register user');
        }
    }

    /**
     * Registers a new manager with the provided details.
     * 
     * @param body - The registration details provided by the manager.
     * @returns A message indicating successful registration and prompts the manager to check their email for verification.
     * @throws InternalServerErrorException - If registration fails due to a server error.
     */
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

    /**
     * Verifies the user's email based on the provided verification code.
     * 
     * @param body - The verification details including email and verification code.
     * @returns A message indicating successful email verification.
     * @throws UnauthorizedException - If the email or verification code is invalid.
     */
    async verify(body: VerifyEmailDto) {
        const user = await this.userRepository.findOne({
            where: { email: body.email, verficationCode: body.verificationCode }
        });

        if (!user) {
            throw new UnauthorizedException('Invalid email or verification code');
        }

        user.isVerified = true;
        user.verficationCode = null;
        await this.userRepository.save(user);

        return { message: 'Your email has been verified! You may now log in to your account.' };
    }

    /**
     * Authenticates a user and generates an access token.
     * 
     * @param body - The login credentials including email and password.
     * @returns An object containing the user data and access token.
     * @throws UnauthorizedException - If the credentials are invalid or email is not verified.
     */
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
            role: user.role
        };

        const accessToken = this.jwtService.sign(payload);
        const { password: _, ...userWithoutPassword } = user;
        return { user: userWithoutPassword, accessToken };
    }

    /**
     * Initiates the password reset process by sending a verification code to the user's email.
     * 
     * @param body - The details including the user's email.
     * @returns A message indicating that a verification code has been sent.
     * @throws UnauthorizedException - If the email is not found in the database.
     * @throws InternalServerErrorException - If there is an error processing the request.
     */
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

    /**
     * Resets the user's password using the provided verification code and new password.
     * 
     * @param body - The details including email, verification code, and new password.
     * @returns A message indicating successful password reset.
     * @throws UnauthorizedException - If the email or code is invalid.
     */
    async resetPassword(body: ResetPasswordDto) {
        const user = await this.userRepository.findOne({ where: { email: body.email, verficationCode: body.verificationCode } });

        if (!user) {
            throw new UnauthorizedException('Invalid email or code');
        }

        user.password = await bcrypt.hash(body.newPassword, 10);
        user.verficationCode = null;
        await this.userRepository.save(user);

        return { message: "Password reset successfully" };
    }

    /**
     * Changes the user's password after validating the current password.
     * 
     * @param userId - The ID of the user.
     * @param body - The details including current password and new password.
     * @returns A message indicating successful password change.
     * @throws UnauthorizedException - If the user is not found or current password is incorrect.
     */
    async changePassword(userId: string, body: ChangePasswordDto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });

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

    /**
     * Handles the callback from Google authentication, creating or retrieving the user.
     * 
     * @param googleProfile - The profile information returned from Google.
     * @returns An object containing the user profile and access token.
     */
    async googleCallback(googleProfile: any) {
        const { email, firstName, lastName } = googleProfile;
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
            role: user.role
        };
        const accessToken = this.jwtService.sign(payload);
        return { Profile: user, accessToken };
    }

    /**
     * Handles the callback from GitHub authentication, creating or retrieving the user.
     * 
     * @param githubProfile - The profile information returned from GitHub.
     * @returns An object containing the user profile and access token.
     */
    async githubCallback(githubProfile: any) {
        const { email, firstName, lastName } = githubProfile;
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