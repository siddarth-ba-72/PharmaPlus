import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import ApiLogger from '../middlewares/ApiLogger';
import ErrorHandler from '../middlewares/ErrorHandler';
import { ApplicationLogger } from '../utils/ApplicationLogger';

class ApplicationMiddlewareConfig {

    private apiLogger: ApiLogger;
    private errorHandler: ErrorHandler;
    private logger: ApplicationLogger;

    constructor() {
        this.apiLogger = new ApiLogger();
        this.errorHandler = new ErrorHandler();
        this.logger = new ApplicationLogger();
    }

    public async initialzeMiddlewares(app: express.Application): Promise<void> {
        app.use(express.json());
        app.use(cookieParser());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(this.apiLogger.logRequest);
        app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
            this.errorHandler.handleErrors(err, req, res, next);
        });
    }

    public async printBanner(): Promise<void> {
        try {
            this.logger.logBanner();
        } catch (err) {
            this.logger.logDebug("");
        }
    }

}

export default ApplicationMiddlewareConfig;