import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password: string;
}
