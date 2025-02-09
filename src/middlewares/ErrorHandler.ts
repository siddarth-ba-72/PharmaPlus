import { UnAuthorizedAccessException } from "../exceptions/UnAuthorizedAccessException";
import { BadRequestException } from "../exceptions/BadRequestException";
import { NextFunction, Request, Response } from "express";

class ErrorHandler {

    // ! Handle Different Types of Errors in this Middleware

    public handleErrors = (error: Error, req: Request, res: Response, next: NextFunction) => {

        if (error instanceof BadRequestException) {
            return res.status(error.responseStatusCode)
                .json({ error: error.message });
        }
        else if (error instanceof UnAuthorizedAccessException) {
            return res.status(error.responseStatusCode)
                .json({ error: error.message });
        }

    }

}

export default ErrorHandler;