import { IsString, IsNotEmpty } from 'class-validator';

export class InviteUserProjectDto {
    @IsString()
    @IsNotEmpty()
    email: string;
}