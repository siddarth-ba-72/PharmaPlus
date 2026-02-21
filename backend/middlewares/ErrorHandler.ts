import { NextFunction, Request, Response } from "express";
import { HttpResponseMiddleware } from "./HttpResponseMiddleware";
import { AbstractException } from "../exceptions/AbstractException";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { ApplicationLogger } from "../utils/ApplicationLogger";

export class ErrorHandler {

    private static httpResponse: HttpResponseMiddleware = new HttpResponseMiddleware();
    private static logger: ApplicationLogger = new ApplicationLogger();

    public static handleError = (error: any, req: Request, res: Response, next: NextFunction): void => {
        const errorLog = this.buildErrorLog(error, req);
        this.logger.logError(errorLog);

        if (res.headersSent) {
            next(error);
            return;
        }

        if (error instanceof AbstractException) {
            this.httpResponse.sendHttpResponse(res, error.statusCode, {
                message: error.message,
            });
        } else if (error instanceof Error) {
            this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        } else {
            this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

    private static buildErrorLog(error: any, req: Request): string {
        const context = `Error occurred in ErrorHandler [${req.method} ${req.originalUrl}]`;
        if (error instanceof Error) {
            return `${context}\n${error.stack || error.message}`;
        }

        try {
            return `${context}\n${JSON.stringify(error)}`;
        } catch {
            return `${context}\nUnknown Error`;
        }
    }

};
