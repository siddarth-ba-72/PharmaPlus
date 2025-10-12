import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from "typeorm"

@Entity('users')
export class UserSchema {

    @PrimaryGeneratedColumn()
    userId!: number;

    @Column({ type: 'varchar', length: 5, unique: true, nullable: false })
    userCode!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    username!: string;

    @Column({ type: 'varchar', length: 100 })
    firstName!: string;

    @Column({ type: 'varchar', length: 100 })
    lastName!: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    emailId!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ type: 'int' })
    age!: number;

    @Column({ type: 'boolean', default: false })
    isAdmin!: boolean;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @BeforeInsert()
    generateUserCode() {
        this.userCode = Math.random().toString(36).substring(2, 7).toUpperCase();
    }

}