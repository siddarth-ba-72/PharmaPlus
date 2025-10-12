import { DataSource, Repository } from "typeorm";
import { MedicineDao } from "../dao/MedicineDao";
import { MedicineSchema } from "../schema/MedicineSchema";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { MedicineMapper } from "../mappers/MedicineMapper";
import { MedicineRequestModel } from "../models/MedicineHttpModels/MedicineRequestModel";
import { MedicineUpdateRequestModel } from "../models/MedicineHttpModels/MedicineUpdateRequestModel";

export class MedicineService implements MedicineDao {

    private dataSource: DataSource;
    private medicineRepository: Repository<MedicineSchema>;
    private medicineMapper: MedicineMapper;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.medicineRepository = this.dataSource.getRepository(MedicineSchema);
        this.medicineMapper = new MedicineMapper();
    }

    public async findAllMedicines(): Promise<MedicineSchema[]> {
        return await this.medicineRepository.find();
    }

    public async findMedicineByMedicineName(medicineName: string): Promise<MedicineSchema | null> {
        return await this.medicineRepository.findOne({
            where: {
                medicineName: medicineName
            }
        });
    }

    public async findMedicineByMedicineCode(medicineCode: string): Promise<MedicineSchema | null> {
        return await this.medicineRepository.findOne({
            where: {
                medicineCode: medicineCode
            }
        });
    }

    public async addMedicine(medicineRequest: MedicineRequestModel): Promise<MedicineSchema> {
        const medicine: MedicineSchema = await this.medicineMapper.toMedicineEntity(medicineRequest);
        return await this.medicineRepository.save(medicine);
    }

    public async updateMedicineDetails(medicine: MedicineSchema, medicineRequest: MedicineUpdateRequestModel): Promise<MedicineSchema> {
        medicine.medicineName = medicineRequest.medicineName;
        medicine.composition = medicineRequest.composition;
        medicine.category = { categoryCode: medicineRequest.categoryCode } as any;
        return await this.medicineRepository.save(medicine);
    }

    public async deleteMedicineRecord(medicine: MedicineSchema): Promise<void> {
        await this.medicineRepository.remove(medicine);
    }

}