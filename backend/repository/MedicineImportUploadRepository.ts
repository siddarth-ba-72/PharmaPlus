import { DataSource, Repository } from "typeorm";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { MedicineImportUploadSchema } from "../schema/MedicineImportUploadSchema";

export class MedicineImportUploadRepository {

    private dataSource: DataSource;
    private repository: Repository<MedicineImportUploadSchema>;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.repository = this.dataSource.getRepository(MedicineImportUploadSchema);
    }

    public async createUploadSession(uploadSession: MedicineImportUploadSchema): Promise<MedicineImportUploadSchema> {
        return await this.repository.save(uploadSession);
    }

    public async findByUploadId(uploadId: string): Promise<MedicineImportUploadSchema | null> {
        return await this.repository.findOne({
            where: { uploadId }
        });
    }

    public async updateUploadSession(uploadSession: MedicineImportUploadSchema): Promise<MedicineImportUploadSchema> {
        return await this.repository.save(uploadSession);
    }

}
