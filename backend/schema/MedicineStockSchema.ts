import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MedicineSchema } from "./MedicineSchema";

@Entity("stocks")
export class MedicineStockSchema {

    @PrimaryGeneratedColumn()
    stockId!: number;

    @OneToOne(() => MedicineSchema, { eager: true })
    @JoinColumn({ name: "medicineCode", referencedColumnName: "medicineCode" })
    medicine!: MedicineSchema;

    @Column({ type: 'int' })
    price!: number;

    @Column({ type: 'int' })
    quantity!: number;

    @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
    mfgDate!: Date;

    @Column({ type: 'date', default: () => `CURRENT_TIMESTAMP + INTERVAL '2 years'` })
    expDate!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @CreateDateColumn()
    updatedAt!: Date;

}