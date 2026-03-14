import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity("medicine_import_row")
@Index(["jobId", "validationStatus"])
@Index(["jobId", "executionStatus"])
@Index(["jobId", "rowNumber"])
export class MedicineImportRowSchema {

    @PrimaryGeneratedColumn()
    rowId!: number;

    @Column({ type: "varchar", length: 64 })
    jobId!: string;

    @Column({ type: "integer" })
    rowNumber!: number;

    @Column({ type: "simple-json", nullable: true })
    originalPayloadJson!: Record<string, any> | null;

    @Column({ type: "simple-json", nullable: true })
    mappedPayloadJson!: Record<string, any> | null;

    @Column({ type: "varchar", length: 32, default: "PENDING" })
    validationStatus!: string;

    @Column({ type: "varchar", length: 32, default: "PENDING" })
    executionStatus!: string;

    @Column({ type: "simple-json", nullable: true })
    errorCodesJson!: Array<{ code: string; message: string }> | null;

    @Column({ type: "text", nullable: true })
    errorMessage!: string | null;

    @Column({ type: "integer", default: 0 })
    retriesAttempted!: number;

    @Column({ type: "varchar", length: 128, nullable: true })
    medicineCode!: string | null;

    @Column({ type: "integer", nullable: true })
    medicineId!: number | null;

    @Column({ type: "varchar", length: 128, nullable: true })
    idempotencyKey!: string | null;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;

}
