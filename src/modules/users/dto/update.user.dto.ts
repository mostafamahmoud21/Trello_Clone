import { IsString, IsEmail, MinLength, MaxLength, IsNotEmpty, IsInt, Min, Max, IsNumber, IsOptional } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    firstName?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    lastName?: string;
}
