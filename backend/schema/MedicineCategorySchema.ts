import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("medicine_category")
export class MedicineCategorySchema {

    @PrimaryGeneratedColumn()
    categoryId!: number;

    @Column({ type: "varchar", unique: true, nullable: false })
    categoryCode!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    categoryName!: string;

}
