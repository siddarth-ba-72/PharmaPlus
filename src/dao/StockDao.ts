import { StockRequestModel } from "../models/StockHttpModels/StockRequestModel";
import { MedicineStockSchema } from "../schema/MedicineStockSchema";

export interface StockDao {

    findAllMedicineStocks(): Promise<MedicineStockSchema[]>;

    findMedicineStockByMedicineCode(medicineCode: string): Promise<MedicineStockSchema | null>;

    saveMedicineStock(stockReq: StockRequestModel): Promise<MedicineStockSchema>;

    updateMedicineStock(medicineStock: MedicineStockSchema, stockReq: StockRequestModel): Promise<MedicineStockSchema>;

    deleteMedicineStock(medicineStock: MedicineStockSchema): Promise<void>

}