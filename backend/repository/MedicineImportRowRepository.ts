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

    public async saveRow(row: MedicineImportRowSchema): Promise<MedicineImportRowSchema> {
        return await this.repository.save(row);
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

    public async findRowByJobAndRowNumber(jobId: string, rowNumber: number): Promise<MedicineImportRowSchema | null> {
        return await this.repository.findOne({
            where: {
                jobId,
                rowNumber
            }
        });
    }

    public async existsAnotherRowWithMedicineCode(
        jobId: string,
        medicineCode: string,
        excludeRowNumber: number
    ): Promise<boolean> {
        const duplicateCount = await this.repository.count({
            where: {
                jobId,
                medicineCode
            }
        });

        if (duplicateCount <= 1) {
            return false;
        }

        const duplicateRows = await this.repository.find({
            where: {
                jobId,
                medicineCode
            }
        });

        return duplicateRows.some((row) => row.rowNumber !== excludeRowNumber);
    }

    public async findExecutableRows(jobId: string): Promise<MedicineImportRowSchema[]> {
        return await this.repository.find({
            where: {
                jobId,
                validationStatus: "VALID",
                executionStatus: "PENDING"
            },
            order: {
                rowNumber: "ASC"
            }
        });
    }

    public async resetRowsForRetry(jobId: string, retryFilter: string): Promise<void> {
        await this.repository
            .createQueryBuilder()
            .update(MedicineImportRowSchema)
            .set({
                executionStatus: "PENDING"
            })
            .where("jobId = :jobId", { jobId })
            .andWhere("executionStatus = :retryFilter", { retryFilter })
            .execute();
    }

    public async getValidationBreakdown(jobId: string): Promise<Record<string, number>> {
        const breakdownRows = await this.repository
            .createQueryBuilder("row")
            .select("row.validationStatus", "status")
            .addSelect("COUNT(*)", "count")
            .where("row.jobId = :jobId", { jobId })
            .groupBy("row.validationStatus")
            .getRawMany();

        return breakdownRows.reduce((acc: Record<string, number>, row: any) => {
            acc[row.status] = Number(row.count);
            return acc;
        }, {});
    }

    public async getExecutionBreakdown(jobId: string): Promise<Record<string, number>> {
        const breakdownRows = await this.repository
            .createQueryBuilder("row")
            .select("row.executionStatus", "status")
            .addSelect("COUNT(*)", "count")
            .where("row.jobId = :jobId", { jobId })
            .groupBy("row.executionStatus")
            .getRawMany();

        return breakdownRows.reduce((acc: Record<string, number>, row: any) => {
            acc[row.status] = Number(row.count);
            return acc;
        }, {});
    }

}
