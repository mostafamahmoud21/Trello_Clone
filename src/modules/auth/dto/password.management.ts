import { IsString, IsNotEmpty, MinLength, MaxLength, IsNumber, Min, Max, IsEmail } from 'class-validator';

export class ChangePasswordDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    currentPassword: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    newPassword: string;
}

export class ForgotPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

export class ResetPasswordDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(100000)
    @Max(999999)
    verificationCode: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    newPassword: string;
}