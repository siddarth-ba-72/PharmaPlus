import "reflect-metadata";
import { DataSource } from 'typeorm';
import { QueryLogger } from '../utils/QueryLogger';
import { PropertyConstants } from '../utils/PropertyConstants';
import { DatabaseInitializationException } from "../exceptions/CustomExceptions";
import { ApplicationLogger } from "../utils/ApplicationLogger";

export class DatabaseConnectionConfig {

    private static instance: DatabaseConnectionConfig;
    private dataSource: DataSource;
    private logger: ApplicationLogger;

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
            entities: ["backend/schema/*.ts"]
        });
        this.logger = new ApplicationLogger();
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
        } catch (error: any) {
            this.logger.logError(error);
            throw new DatabaseInitializationException(500, "Failed to initialize the database connection");
        }
    }

    public getDataSource(): DataSource {
        return this.dataSource;
    }

};