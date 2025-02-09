import { DataSource, Repository } from "typeorm";
import { UserSchema } from "../schema/UserSchema";
import DatabaseConnection from "../middlewares/DatabaseConnection";

export class UserDao {

    private dataSource: DataSource;
    public userDao: Repository<UserSchema>;

    constructor() {
        this.dataSource = DatabaseConnection.getInstance().getDataSource();
        this.userDao = this.dataSource.getRepository(UserSchema);
    }

}