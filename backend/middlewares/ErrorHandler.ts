import { NextFunction, Request, Response } from "express";
import { HttpResponseMiddleware } from "./HttpResponseMiddleware";
import { AbstractException } from "../exceptions/AbstractException";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { ApplicationLogger } from "../utils/ApplicationLogger";

class ErrorHandler {

    protected httpResponse: HttpResponseMiddleware;
    private logger: ApplicationLogger;

    constructor() {
        this.httpResponse = new HttpResponseMiddleware();
        this.logger = new ApplicationLogger();
    }

    public handleErrors = (error: Error, req: Request, res: Response, next: NextFunction) => {
        this.logger.logError(`Error occurred: ${error.message}`);
        if (error instanceof AbstractException) {
            return this.httpResponse.sendHttpResponse(res, error.statusCode, {
                message: error.message,
            });
        } else if (error instanceof Error) {
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: `Something went wrong! : ${error.message}`,
            });
        }
    }

}

export default ErrorHandler;