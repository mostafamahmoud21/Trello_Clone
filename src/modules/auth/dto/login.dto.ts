import { IsEmail, IsString, MinLength, MaxLength, IsNotEmpty, IsOptional } from 'class-validator';

export class LoginDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    @MaxLength(20)
    password?: string;
}
