import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty, IsInt, Min, Max, IsNumber, IsOptional } from 'class-validator';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    firstName: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    lastName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password?: string;
}

export class VerifyEmailDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsNumber()
    @Min(100000) 
    @Max(999999) 
    verificationCode: number;

}