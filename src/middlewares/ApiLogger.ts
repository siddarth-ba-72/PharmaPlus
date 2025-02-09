import { NextFunction, Request, Response } from "express";
import { ApplicationLogger } from "../utils/ApplicationLogger";

class ApiLogger {

    private logger: ApplicationLogger;

    constructor() {
        this.logger = new ApplicationLogger();
    }

    public logRequest = (req: Request, res: Response, next: NextFunction): void => {
        const method = req.method;
        const url = req.originalUrl;
        const timestamp = new Date().toISOString();
        this.logger.logApi(`API Called: [${method}] ${url} at ${timestamp}`);
        next();
    }
}

export default ApiLogger;