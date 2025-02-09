import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity('users')
export class UserSchema {

    @PrimaryGeneratedColumn()
    userId!: number;

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
}