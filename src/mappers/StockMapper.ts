import { MedicineStockSchema } from "../schema/MedicineStockSchema";
import { StockRequestModel } from "../models/StockHttpModels/StockRequestModel";
import { StockResponseModel } from "../models/StockHttpModels/StockResponseModel";
import { MedicineSchema } from "../schema/MedicineSchema";

export class StockMapper {

    public async toStockEntity(stockReq: StockRequestModel): Promise<MedicineStockSchema> {
        const stock = new MedicineStockSchema();
        stock.medicine = { medicineCode: stockReq.medicineCode } as any;
        stock.quantity = stockReq.quantity;
        stock.price = stockReq.price;
        return stock;
    }

    public async toStockResponse(stock: MedicineStockSchema): Promise<StockResponseModel> {
        const stockResponse = new StockResponseModel();
        stockResponse.medicineName = stock.medicine ? stock.medicine.medicineName : null;
        stockResponse.medicineCode = stock.medicine ? stock.medicine.medicineCode : null;
        stockResponse.category = stock.medicine ?
            stock.medicine.category ? stock.medicine.category.categoryName : null : null;
        stockResponse.categoryCode = stock.medicine ?
            stock.medicine.category ? stock.medicine.category.categoryCode : null : null;
        stockResponse.quantity = stock.quantity;
        stockResponse.price = stock.price;
        stockResponse.mfgDate = stock.mfgDate;
        stockResponse.expDate = stock.expDate;
        return stockResponse;
    }

    public async mapToStockResponseArray(medicineStocks: MedicineStockSchema[]): Promise<StockResponseModel[]> {
        const medicineResponseModelArray: StockResponseModel[] = [];
        for (const medicineStock of medicineStocks) {
            medicineResponseModelArray.push(await this.toStockResponse(medicineStock));
        }
        return medicineResponseModelArray;
    }

}