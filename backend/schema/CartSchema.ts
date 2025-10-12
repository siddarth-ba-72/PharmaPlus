import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserSchema } from "./UserSchema";
import { MedicineSchema } from "./MedicineSchema";

@Entity("cart")
export class CartSchema {

    @PrimaryGeneratedColumn()
    cartId!: number;

    @Column({ type: "varchar", nullable: false })
    cartCode!: string;

    @ManyToOne(() => UserSchema, { eager: true })
    @JoinColumn({ name: "userCode", referencedColumnName: "userCode" })
    user!: UserSchema;

    @ManyToOne(() => MedicineSchema, { eager: true })
    @JoinColumn({ name: "medicineCode", referencedColumnName: "medicineCode" })
    medicine!: MedicineSchema;

    @Column({ type: 'int' })
    quantity!: number;

}