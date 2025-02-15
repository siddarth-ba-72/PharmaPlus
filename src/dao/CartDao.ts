import { CartSchema } from "../schema/CartSchema";
import { DataSource, Repository } from "typeorm";
import DatabaseConnection from "../middlewares/DatabaseConnection";
import { MedicineStockSchema } from "../schema/MedicineStockSchema";

export class CartDao {

    private dataSource: DataSource;
    public cartDao: Repository<CartSchema>;
    public stockDao: Repository<MedicineStockSchema>;

    constructor() {
        this.dataSource = DatabaseConnection.getInstance().getDataSource();
        this.cartDao = this.dataSource.getRepository(CartSchema);
        this.stockDao = this.dataSource.getRepository(MedicineStockSchema);
    }
}