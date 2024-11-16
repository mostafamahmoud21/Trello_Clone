import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsOptional()
    @IsEnum(['TO_DO', 'IN_PROGRESS', 'DONE'], { message: 'Status must be TO_DO, IN_PROGRESS, or DONE' })
    status?: string;
}
