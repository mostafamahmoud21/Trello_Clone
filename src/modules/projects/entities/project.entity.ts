import { User } from 'src/modules/users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Projects {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    description: string;


    @ManyToOne(() => User, (user) => user.projects)
    user: User
}
