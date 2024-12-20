import { Projects } from 'src/modules/projects/entities/project.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/modules/auth/enums/role.enum';
@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({
        type: 'enum',
        enum: Roles,
        default: Roles.USER,
    })
    role: Roles;

    @Column({ default: false })
    isVerified: boolean

    @Column({ nullable: true })
    verficationCode: number;

    @Column({ default: false })
    isBlocked: boolean
    
    @BeforeInsert()
    async hashPassword() {
        if (this.password) {
            this.password = await bcrypt.hash(this.password, 10);
            this.verficationCode = Math.floor(100000 + Math.random() * 900000);
        }
    }

    async comparePassword(password: string) {
        return await bcrypt.compare(password, this.password);
    }

    @OneToMany(() => Projects, project => project.user)
    projects: Projects[]
}
