import "reflect-metadata";
import { DataSource } from 'typeorm';
import { QueryLogger } from '../middlewares/QueryLogger';
import { PropertyConstants } from '../utils/PropertyConstants';
import { DatabaseInitializationException } from "../exceptions/DatabaseInitializationException";

class DatabaseConnectionConfig {

    private static instance: DatabaseConnectionConfig;
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

    public static getInstance(): DatabaseConnectionConfig {
        if (!DatabaseConnectionConfig.instance) {
            DatabaseConnectionConfig.instance = new DatabaseConnectionConfig();
        }
        return DatabaseConnectionConfig.instance;
    }

    public async initialize(): Promise<void> {
        try {
            await this.dataSource.initialize();
            console.log("Database connected!");
        } catch (error) {
            console.log("Error during Data Source initialization: ", error);
            throw new DatabaseInitializationException(500, "Failed to initialize the database connection");
        }
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }

}

export default DatabaseConnectionConfig;