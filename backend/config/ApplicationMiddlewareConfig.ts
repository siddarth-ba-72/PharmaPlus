import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import ApiLogger from '../middlewares/ApiLogger';
import { ApplicationLogger } from '../utils/ApplicationLogger';
import { ErrorHandler } from '../middlewares/ErrorHandler';

export class ApplicationMiddlewareConfig {

    private apiLogger: ApiLogger;
    private logger: ApplicationLogger;

    constructor() {
        this.apiLogger = new ApiLogger();
        this.logger = new ApplicationLogger();
    }

    public async initialzeMiddlewares(app: express.Application): Promise<void> {
        app.use(cors({
            origin: 'http://localhost:5173',
            credentials: true,
        }));
        app.use(express.json());
        app.use(cookieParser());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(this.apiLogger.logRequest);
    }

    public async initializeErrorMiddleware(app: express.Application): Promise<void> {
        app.use(ErrorHandler.handleError);
    }

    public async printBanner(): Promise<void> {
        try {
            this.logger.logBanner();
        } catch (err) {
            this.logger.logDebug("");
        }
    }

}
