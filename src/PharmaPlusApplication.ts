import express from 'express';
import { PropertyConstants } from './utils/PropertyConstants';
import DatabaseConnectionConfig from './config/DatabaseConnectionConfig';
import RouterConfig from './config/RouterConfig';
import ApplicationMiddlewareConfig from './config/ApplicationMiddlewareconfig';

class PharmaPlusApplication {

    private app: express.Application;
    private database: DatabaseConnectionConfig;
    private routerConfig: RouterConfig;
    private appMiddlewareConfig: ApplicationMiddlewareConfig;
    private webHost: string = PropertyConstants.WEB_HOST;
    private webPort: number = PropertyConstants.WEB_PORT;

    constructor() {
        this.app = express();
        this.database = DatabaseConnectionConfig.getInstance();
        this.routerConfig = new RouterConfig();
        this.appMiddlewareConfig = new ApplicationMiddlewareConfig();
        this.initializeDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.startServer();
    }

    private initializeDatabase(): void {
        this.database.initialize()
            .then(() => {
                console.log("Database connected successfully.");
            })
            .catch((error) => {
                console.error("Error in database connection: ", error);
            });
    }

    private initializeMiddlewares(): void {
        this.appMiddlewareConfig.initialzeMiddlewares(this.app)
            .then(() => {
                console.log("Middlewares initialized successfully.");
            })
            .catch((error) => {
                console.error("Error initializing middlewares: ", error);
            });
    }

    private initializeRoutes(): void {
        this.routerConfig.initializeRoutes(this.app)
            .then(() => {
                console.log("Routes initialized successfully.");
            })
            .catch((error) => {
                console.error("Error initializing routes: ", error);
            });
    }

    private startServer(): void {
        this.app.listen(this.webPort, () => {
            console.log(`Server is running on http://${this.webHost}:${this.webPort}`);
        });
    }

    public getApp(): express.Application {
        return this.app;
    }

}

export default new PharmaPlusApplication();