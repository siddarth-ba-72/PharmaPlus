import { DataSource, Repository } from "typeorm";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { MedicineImportJobSchema } from "../schema/MedicineImportJobSchema";

export class MedicineImportJobRepository {

    private dataSource: DataSource;
    private repository: Repository<MedicineImportJobSchema>;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.repository = this.dataSource.getRepository(MedicineImportJobSchema);
    }

    public async createJob(job: MedicineImportJobSchema): Promise<MedicineImportJobSchema> {
        return await this.repository.save(job);
    }

    public async findByJobId(jobId: string): Promise<MedicineImportJobSchema | null> {
        return await this.repository.findOne({
            where: { jobId }
        });
    }

    public async updateJob(job: MedicineImportJobSchema): Promise<MedicineImportJobSchema> {
        return await this.repository.save(job);
    }

}
