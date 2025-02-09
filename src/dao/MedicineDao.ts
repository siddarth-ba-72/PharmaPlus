import { DataSource, Repository } from "typeorm";
import { MedicineSchema } from "../schema/MedicineSchema";
import { MedicineStockSchema } from "../schema/MedicineStockSchema";
import { MedicineCategorySchema } from "../schema/MedicineCategorySchema";
import DatabaseConnection from "../middlewares/DatabaseConnection";

export class MedicineDao {

    private dataSource: DataSource;
    public medicineDao: Repository<MedicineSchema>;
    public medicineCategoryDao: Repository<MedicineCategorySchema>;
    public medicineStockDao: Repository<MedicineStockSchema>;

    constructor() {
        this.dataSource = DatabaseConnection.getInstance().getDataSource();
        this.medicineDao = this.dataSource.getRepository(MedicineSchema);
        this.medicineCategoryDao = this.dataSource.getRepository(MedicineCategorySchema);
        this.medicineStockDao = this.dataSource.getRepository(MedicineStockSchema);
    }

}