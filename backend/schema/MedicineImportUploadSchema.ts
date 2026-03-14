import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";

@Entity("medicine_import_upload_session")
export class MedicineImportUploadSchema {

    @PrimaryColumn({ type: "varchar", length: 64 })
    uploadId!: string;

    @Column({ type: "varchar", length: 255 })
    fileName!: string;

    @Column({ type: "varchar", length: 255 })
    mimeType!: string;

    @Column({ type: "integer" })
    sizeBytes!: number;

    @Column({ type: "varchar", length: 128, nullable: true })
    checksumSha256!: string | null;

    @Column({ type: "varchar", length: 1024, nullable: true })
    storagePath!: string | null;

    @Column({ type: "simple-json", nullable: true })
    sheetNames!: string[] | null;

    @Column({ type: "simple-json", nullable: true })
    headerRowCandidates!: number[] | null;

    @Column({ type: "varchar", length: 32, default: "CREATED" })
    status!: string;

    @Column({ type: "timestamp" })
    expiresAt!: Date;

    @CreateDateColumn({ type: "timestamp" })
    createdAt!: Date;

    @UpdateDateColumn({ type: "timestamp" })
    updatedAt!: Date;

}
