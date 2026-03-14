import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";

@Entity("medicine_import_job")
export class MedicineImportJobSchema {

    @PrimaryColumn({ type: "varchar", length: 64 })
    jobId!: string;

    @Column({ type: "varchar", length: 64 })
    uploadId!: string;

    @Column({ type: "varchar", length: 64, nullable: true })
    createdByUserId!: string | null;

    @Column({ type: "varchar", length: 32, default: "CREATE_ONLY" })
    mode!: string;

    @Column({ type: "boolean", default: true })
    dryRun!: boolean;

    @Column({ type: "varchar", length: 64, default: "DRAFT" })
    state!: string;

    @Column({ type: "varchar", length: 255 })
    sheetName!: string;

    @Column({ type: "integer" })
    headerRowIndex!: number;

    @Column({ type: "integer", default: 0 })
    totalRows!: number;

    @Column({ type: "integer", default: 0 })
    validRows!: number;

    @Column({ type: "integer", default: 0 })
    warningRows!: number;

    @Column({ type: "integer", default: 0 })
    invalidRows!: number;

    @Column({ type: "simple-json", nullable: true })
    summaryJson!: Record<string, any> | null;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;

}
