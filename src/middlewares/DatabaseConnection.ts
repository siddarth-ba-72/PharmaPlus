import "reflect-metadata";
import { DataSource } from 'typeorm';
import { QueryLogger } from '../middlewares/QueryLogger';
import { PropertyConstants } from '../utils/PropertyConstants';

class DatabaseConnection {

    private static instance: DatabaseConnection;
    private dataSource: DataSource;

    private constructor() {
        this.dataSource = new DataSource({
            type: "postgres",
            host: PropertyConstants.DATABASE_HOST,
            port: PropertyConstants.DATABASE_PORT,
            username: PropertyConstants.DATABASE_USERNAME,
            password: PropertyConstants.DATABASE_PASSWORD,
            database: PropertyConstants.DATABASE_SCHEMA,
            synchronize: true,
            logging: true,
            logger: new QueryLogger(),
            entities: ["src/schema/*.ts"]
        });
    };

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async initialize(): Promise<void> {
        try {
            await this.dataSource.initialize();
            console.log("Database connected!");
        } catch (error) {
            console.log("Error during Data Source initialization: ", error);
        }
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }

}

export default DatabaseConnection;


