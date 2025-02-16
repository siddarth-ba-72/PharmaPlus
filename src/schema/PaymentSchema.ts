import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserSchema } from "./UserSchema";
import { OrderSchema } from "./OrderSchema";
import { PaymentTypeSchema } from "./PaymentTypesSchema";

@Entity("payment")
export class PaymentSchema {

    @PrimaryGeneratedColumn()
    paymentId!: number;

    @Column({ type: 'varchar', nullable: true, unique: true })
    paymentCode!: string;

    @ManyToOne(() => UserSchema, { eager: true })
    @JoinColumn({ name: "userCode", referencedColumnName: "userCode" })
    user!: UserSchema;

    @Column({ type: 'int' })
    paymentPrice!: number;

    @ManyToOne(() => PaymentTypeSchema, { eager: true })
    @JoinColumn({ name: "paymentTypeCode", referencedColumnName: "paymentTypeCode" })
    paymentType!: PaymentTypeSchema;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", update: false })
    paymentDate!: Date;

}