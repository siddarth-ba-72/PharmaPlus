import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { MedicineSchema } from "./MedicineSchema";
import { OrderSchema } from "./OrderSchema";

@Entity("order_medicines")
export class OrderMedicineSchema {

    @PrimaryGeneratedColumn()
    orderMedicineId!: number;

    @ManyToOne(() => OrderSchema, { eager: true })
    @JoinColumn({ name: "orderMedicineCode", referencedColumnName: "orderMedicineCode" })
    order!: OrderSchema;

    @ManyToOne(() => MedicineSchema, { eager: true })
    @JoinColumn({ name: "medicineCode", referencedColumnName: "medicineCode" })
    medicine!: MedicineSchema;

    @Column({ type: "int" })
    quantity!: number;

}
