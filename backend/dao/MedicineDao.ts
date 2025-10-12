import { MedicineRequestModel } from "../models/MedicineHttpModels/MedicineRequestModel";
import { MedicineUpdateRequestModel } from "../models/MedicineHttpModels/MedicineUpdateRequestModel";
import { MedicineSchema } from "../schema/MedicineSchema";

export interface MedicineDao {

    findAllMedicines(): Promise<MedicineSchema[]>;

    findMedicineByMedicineName(medicineName: string): Promise<MedicineSchema | null>;

    findMedicineByMedicineCode(medicineCode: string): Promise<MedicineSchema | null>;

    addMedicine(medicineRequest: MedicineRequestModel): Promise<MedicineSchema>;

    updateMedicineDetails(medicine: MedicineSchema, medicineRequest: MedicineUpdateRequestModel): Promise<MedicineSchema>;

    deleteMedicineRecord(medicine: MedicineSchema): Promise<void>;

}