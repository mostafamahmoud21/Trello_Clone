import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTaskDto {
    @IsOptional()
    @IsNotEmpty()
    @IsString()
    name?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNotEmpty()
    @IsEnum(['TO_DO', 'IN_PROGRESS', 'DONE'], { message: 'Status must be TO_DO, IN_PROGRESS, or DONE' })
    status?: string;
}

export class ChangeStatusDto {
    @IsOptional()
    @IsNotEmpty()
    @IsEnum(['TO_DO', 'IN_PROGRESS', 'DONE'], { message: 'Status must be TO_DO, IN_PROGRESS, or DONE' })
    status?: string;
}