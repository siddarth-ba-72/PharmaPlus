import { MedicineRequestModel } from "../models/MedicineHttpModels/MedicineRequestModel";
import { MedicineResponseModel } from "../models/MedicineHttpModels/MedicineResponseModel";
import { MedicineSchema } from "../schema/MedicineSchema";

export class MedicineMapper {

    public async toMedicineEntity(medicineReq: MedicineRequestModel): Promise<MedicineSchema> {
        const medicineEntity = new MedicineSchema();
        medicineEntity.medicineName = medicineReq.medicineName;
        medicineEntity.medicineCode = medicineReq.medicineCode;
        medicineEntity.composition = medicineReq.composition;
        medicineEntity.category = { categoryCode: medicineReq.categoryCode } as any;
        return medicineEntity;
    }

    public async mapToMedicineResponse(medicine: MedicineSchema): Promise<MedicineResponseModel> {
        const medicineResponseModel = new MedicineResponseModel();
        medicineResponseModel.medicineName = medicine.medicineName;
        medicineResponseModel.medicineCode = medicine.medicineCode;
        medicineResponseModel.composition = medicine.composition;
        medicineResponseModel.category = medicine.category ? medicine.category.categoryName : null;
        return medicineResponseModel;

    }

    public async mapToMedicineResponseArray(medicines: MedicineSchema[]): Promise<MedicineResponseModel[]> {
        const medicineResponseModelArray: MedicineResponseModel[] = [];
        for (const medicine of medicines) {
            medicineResponseModelArray.push(await this.mapToMedicineResponse(medicine));
        }
        return medicineResponseModelArray;
    }

}