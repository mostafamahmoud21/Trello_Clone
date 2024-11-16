import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Projects } from 'src/modules/projects/entities/project.entity';

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: ['TO_DO', 'IN_PROGRESS', 'DONE'],
        default: 'TO_DO',
    })
    status: string;

    @ManyToOne(() => User, (user) => user.projects)
    assignedUser: User;

    @ManyToOne(() => Projects, (project) => project.id)
    project: Projects;
}
