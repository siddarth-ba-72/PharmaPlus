import express from 'express';
import UserRouter from './routes/UserRouter';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import ApiLogger from './middlewares/ApiLogger';
import { PropertyConstants } from './utils/PropertyConstants';
import ErrorHandler from './middlewares/ErrorHandler';
import MedicineRouter from './routes/MedicineRouter';
import StockRouter from './routes/StockRouter';
import DatabaseConnection from './middlewares/DatabaseConnection';
import CartRouter from './routes/CartRouter';
import OrderRouter from './routes/OrderRouter';

class PharmaPlusApplication {

    private app: express.Application;
    private apiLogger: ApiLogger;
    private database: DatabaseConnection;
    private errorHandler: ErrorHandler;
    private webHost: string = PropertyConstants.WEB_HOST;
    private webPort: number = PropertyConstants.WEB_PORT;

    constructor() {
        this.app = express();
        this.apiLogger = new ApiLogger();
        this.database = DatabaseConnection.getInstance();
        this.errorHandler = new ErrorHandler();
        this.initializeDatabase();
        this.initializeMiddlewares();
        this.initializeRoutes();
        // this.initializeErrorHandling();
        this.startServer();
    }

    private initializeDatabase(): void {
        this.database.initialize();
    }

    private initializeMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(cookieParser());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(this.apiLogger.logRequest);
    }

    private initializeRoutes(): void {
        this.app.use("/pp/webapp/api/users", UserRouter);
        this.app.use("/pp/webapp/api/medicines", MedicineRouter);
        this.app.use("/pp/webapp/api/stocks", StockRouter);
        this.app.use("/pp/webapp/api/carts", CartRouter);
        this.app.use("/pp/webapp/api/orders", OrderRouter);
    }

    private initializeErrorHandling(): void {
        this.app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.errorHandler.handleErrors(err, req, res, next);
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

