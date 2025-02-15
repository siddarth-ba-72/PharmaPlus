import { DataSource, Repository } from "typeorm";
import { StockDao } from "../dao/StockDao";
import { MedicineStockSchema } from "../schema/MedicineStockSchema";
import DatabaseConnection from "../middlewares/DatabaseConnection";
import { StockRequestModel } from "../models/StockHttpModels/StockRequestModel";
import { StockMapper } from "../mappers/StockMapper";

export class StockService implements StockDao {

    private dataSource: DataSource;
    private stockRepository: Repository<MedicineStockSchema>;
    private stockMapper: StockMapper;

    constructor() {
        this.dataSource = DatabaseConnection.getInstance().getDataSource();
        this.stockRepository = this.dataSource.getRepository(MedicineStockSchema);
        this.stockMapper = new StockMapper();
    }

    public async findAllMedicineStocks(): Promise<MedicineStockSchema[]> {
        return await this.stockRepository.find();
    }

    public async findMedicineStockByMedicineCode(medicineCode: string): Promise<MedicineStockSchema | null> {
        return await this.stockRepository.findOne({
            where: {
                medicine: {
                    medicineCode: medicineCode
                }
            }
        })
    }

    public async saveMedicineStock(stockReq: StockRequestModel): Promise<MedicineStockSchema> {
        const stock: MedicineStockSchema = await this.stockMapper.toStockEntity(stockReq);
        return await this.stockRepository.save(stock);
    }

    public async updateMedicineStock(medicineStock: MedicineStockSchema, stockReq: StockRequestModel): Promise<MedicineStockSchema> {
        medicineStock.price += stockReq.price;
        medicineStock.quantity += stockReq.quantity;
        return await this.stockRepository.save(medicineStock);
    }

    public async deleteMedicineStock(medicineStock: MedicineStockSchema): Promise<void> {
        await this.stockRepository.remove(medicineStock);
    }

}