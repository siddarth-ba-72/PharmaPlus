import { DataSource, FindOptionsWhere, Repository } from "typeorm";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { MedicineImportRowSchema } from "../schema/MedicineImportRowSchema";

export class MedicineImportRowRepository {

    private dataSource: DataSource;
    private repository: Repository<MedicineImportRowSchema>;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.repository = this.dataSource.getRepository(MedicineImportRowSchema);
    }

    public async saveRows(rows: MedicineImportRowSchema[]): Promise<MedicineImportRowSchema[]> {
        return await this.repository.save(rows);
    }

    public async findRowsByJobId(
        jobId: string,
        page: number,
        pageSize: number,
        validationStatus?: string,
        executionStatus?: string
    ): Promise<{ rows: MedicineImportRowSchema[]; total: number }> {
        const whereClause: FindOptionsWhere<MedicineImportRowSchema> = { jobId };
        if (validationStatus) {
            whereClause.validationStatus = validationStatus;
        }
        if (executionStatus) {
            whereClause.executionStatus = executionStatus;
        }

        const [rows, total] = await this.repository.findAndCount({
            where: whereClause,
            order: { rowNumber: "ASC" },
            skip: (page - 1) * pageSize,
            take: pageSize
        });

        return { rows, total };
    }

}
