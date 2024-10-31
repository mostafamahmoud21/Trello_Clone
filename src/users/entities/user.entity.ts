import { Projects } from 'src/projects/entities/project.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column({ unique: true })
    email: string;


    @Column()
    password: string;

    @OneToMany(()=>Projects, project => project.user)
    projects: Projects[]
}
