import { Request, Response, NextFunction } from "express";

export class AsyncRequestHandler {

    public static handleRequest(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
        return (req: Request, res: Response, next: NextFunction): void => {
            Promise.resolve(fn(req, res, next)).catch(next);
        };
    }

}