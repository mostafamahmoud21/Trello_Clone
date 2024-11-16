import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssignedTasksDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    email?: string;
}
