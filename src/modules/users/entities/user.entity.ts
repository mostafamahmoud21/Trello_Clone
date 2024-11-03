import { Projects } from 'src/modules/projects/entities/project.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BeforeInsert } from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    // @BeforeInsert()
    // async hashPassword(){
    //     this.password= await
    // }
    @OneToMany(() => Projects, project => project.user)
    projects: Projects[]
}
