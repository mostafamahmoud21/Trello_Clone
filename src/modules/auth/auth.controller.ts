import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, VerifyEmailDto } from './dto/register.dto';
import { CheckIfUserExit } from './guards/check-if-user-exit';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from './dto/password.management';
import { Request } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { User } from './types/express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registers a new user.
   * 
   * @param body - The registration details provided by the user.
   * @returns The result of the registration process.
   */
  @Post('register')
  @UseGuards(CheckIfUserExit)
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  /**
   * Registers a new manager.
   * 
   * @param body - The registration details provided by the manager.
   * @returns The result of the manager registration process.
   */
  @Post('register-manager')
  @UseGuards(CheckIfUserExit)
  registerManager(@Body() body: RegisterDto) {
    return this.authService.registerManager(body);
  }

  /**
   * Verifies the user's email.
   * 
   * @param body - The verification details including email and verification code.
   * @returns The result of the email verification process.
   */
  @Post('verify')
  verify(@Body() body: VerifyEmailDto) {
    return this.authService.verify(body);
  }

  /**
   * Logs in a user and returns an access token.
   * 
   * @param body - The login credentials including email and password.
   * @returns The result of the login process.
   */
  @Post('login')
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  /**
   * Initiates the password reset process by sending a verification code to the user's email.
   * 
   * @param body - The details including the user's email.
   * @returns The result of the password reset initiation process.
   */
  @Post('forget-password')
  forgetPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgetPassword(body);
  }

  /**
   * Resets the user's password using the provided verification code and new password.
   * 
   * @param body - The details including email, verification code, and new password.
   * @returns The result of the password reset process.
   */
  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  /**
   * Changes the user's password after validating the current password.
   * 
   * @param req - The request object containing user information.
   * @param body - The details including current password and new password.
   * @returns The result of the password change process.
   */
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req: Request, @Body() body: ChangePasswordDto) {
    const userId = (req.user as User).id;
    return this.authService.changePassword(userId, body);
  }

  /**
   * Initiates Google login.
   * 
   * @returns A message indicating the login process has started.
   */
  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  googleLogin() {
    return 'login';
  }

  /**
   * Handles the callback from Google authentication and processes the user profile.
   * 
   * @param req - The request object containing user information from Google.
   * @returns The result of the Google login process.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req: Request) {
    const googleProfile = req.user;
    return this.authService.googleCallback(googleProfile);
  }

  /**
   * Initiates GitHub login.
   * 
   * @returns A message indicating the login process has started.
   */
  @Get('github/login')
  @UseGuards(AuthGuard('github'))
  githubLogin() {
    return; // You may want to return a message if needed
  }

  /**
   * Handles the callback from GitHub authentication and processes the user profile.
   * 
   * @param req - The request object containing user information from GitHub.
   * @returns The result of the GitHub login process.
   */
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  githubCallback(@Req() req: Request) {
    const githubProfile = req.user;
    return this.authService.githubCallback(githubProfile);
  }
}