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
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  @UseGuards(CheckIfUserExit)
  register(@Body() body: RegisterDto) {
    return this.authService.register(body)
  }

  @Post('verifiy')
  verify(@Body() body:VerifyEmailDto) {
    return this.authService.verify(body)
  }

  @Post('login')
  login(@Body() body: LoginDto) { 
    return this.authService.login(body)
  }

  @Post('forget-password')
  forgetPassword(@Body() body:ForgotPasswordDto){
    return this.authService.forgetPassword(body)
  }

  @Post('reset-password')
  resetPassword(@Body() body:ResetPasswordDto){
    return this.authService.resetPassword(body)
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Req() req:Request, @Body() body:ChangePasswordDto){
    const userId= (req.user as User).id;
    console.log(userId)
    return this.authService.changePassword(userId,body)
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  googleLogin(){
    return 'login'
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req:Request){
    const googleProfile=req.user
    return this.authService.googleCallback(googleProfile)
  }
}
