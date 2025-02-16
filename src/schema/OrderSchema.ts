import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { UserSchema } from "./UserSchema";
import { PaymentSchema } from "./PaymentSchema";

@Entity("orders")
export class OrderSchema {

    @PrimaryGeneratedColumn()
    orderId!: number;

    @ManyToOne(() => UserSchema, { eager: true })
    @JoinColumn({ name: "userCode", referencedColumnName: "userCode" })
    user!: UserSchema;

    @Column({ type: 'varchar', unique: true, nullable: false })
    orderMedicineCode!: string;

    @OneToOne(() => PaymentSchema, { eager: true })
    @JoinColumn({ name: "paymentCode", referencedColumnName: "paymentCode" })
    payment!: PaymentSchema;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    orderDate!: Date;

}
