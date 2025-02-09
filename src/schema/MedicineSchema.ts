import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedicineCategorySchema } from "./MedicineCategorySchema";

@Entity("medicine")
export class MedicineSchema {

    @PrimaryGeneratedColumn()
    medicineId!: number;

    @Column({ type: "varchar", unique: true, nullable: false })
    medicineCode!: string;

    @Column({ type: "varchar", length: 255, unique: true, nullable: false })
    medicineName!: string;

    @Column({ type: "text" })
    composition!: string;

    @ManyToOne(() => MedicineCategorySchema, { eager: true })
    @JoinColumn({ name: "categoryCode", referencedColumnName: "categoryCode" })
    category!: MedicineCategorySchema;

}
