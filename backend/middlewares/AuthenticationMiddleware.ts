import { NextFunction, Request, Response } from "express";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { HttpResponseMiddleware } from "./HttpResponseMiddleware";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { UnAuthorizedAccessException } from "../exceptions/CustomExceptions";
import { AsyncRequestHandler } from "./AsyncRequestHandler";

export class AuthenticationMiddleware {

    private httpResponse: HttpResponseMiddleware;
    private logger: ApplicationLogger;

    constructor() {
        this.httpResponse = new HttpResponseMiddleware();
        this.logger = new ApplicationLogger();
    }

    public checkIsNotLoggedIn = AsyncRequestHandler.handleRequest(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (authToken) {
            this.logger.logInfo("User already logged in");
            return await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                message: "User already logged in"
            });
        }
        return next();
    });

    public authenticate = AsyncRequestHandler.handleRequest(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (!authToken) {
            this.logger.logError("Invalid or expired token");
            throw new UnAuthorizedAccessException(
                HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE,
                "Unauthorized Access"
            );
        }
        const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
        if (!decodedUser) {
            this.logger.logError("Invalid or expired token");
            throw new UnAuthorizedAccessException(
                HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE,
                "Unauthorized Access"
            );
        }

        const { iat, exp, ...userDetails } = decodedUser;
        req.body.user = userDetails;
        next();
    });

    public checkAndAuthenticate = AsyncRequestHandler.handleRequest(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (!authToken) {
            this.logger.logWarn("No token found, proceeding without authentication");
            return next();
        }
        const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
        if (!decodedUser) {
            this.logger.logWarn("No user information found in token, proceeding without authentication");
            return next();
        }

        const { iat, exp, ...userDetails } = decodedUser;
        req.body.user = userDetails;
        next();
    });

    public authenticateAdmin = AsyncRequestHandler.handleRequest(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (!authToken) {
            this.logger.logError("Invalid or expired token");
            await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                message: "Unauthorized Access"
            });
            return;
        }

        const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
        if (!decodedUser) {
            this.logger.logError("Invalid or expired token");
            await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                message: "Unauthorized Access"
            });
            return;
        }

        if (!decodedUser.isAdmin) {
            return await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                message: "Unauthorized Access"
            });
        }

        const { iat, exp, ...userDetails } = decodedUser;
        req.body.user = userDetails;
        next();
    });

    public checkResetToken = AsyncRequestHandler.handleRequest(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const resetPasswordToken = req.cookies.reset_password_token;
        if (!resetPasswordToken) {
            return await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                message: "Unauthorized Access"
            });
        }

        const decodedUser: any = JSON.parse(await JwtAuthentication.verifyPasswordToken(resetPasswordToken));
        if (!decodedUser) {
            return await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                message: "Unauthorized Access"
            });
        }

        const { iat, exp, ...userDetails } = decodedUser;
        req.body.resetPasswordUser = userDetails;
        next();
    });

}
