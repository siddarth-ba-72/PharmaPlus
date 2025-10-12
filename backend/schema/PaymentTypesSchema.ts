import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("payment_type")
export class PaymentTypeSchema {

    @PrimaryGeneratedColumn()
    paymentTypeId!: number;

    @Column({ type: "varchar", unique: true, nullable: false })
    paymentTypeCode!: string;

    @Column({ type: "varchar", length: 100, unique: true })
    paymentMethod!: string;

}