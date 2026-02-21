import { NextFunction, Request, Response } from "express";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { HttpResponseMiddleware } from "./HttpResponseMiddleware";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { UnAuthorizedAccessException } from "../exceptions/CustomExceptions";
import { UserDao } from "../dao/UserDao";
import { UserDaoRepository } from "../repository/UserDaoRepository";
import { AsyncRequestHandler } from "./AsyncRequestHandler";

export class AuthenticationMiddleware {

    private userRepository: UserDao;
    private httpResponse: HttpResponseMiddleware;
    private logger: ApplicationLogger;

    constructor() {
        this.userRepository = new UserDaoRepository();
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

        const user = await this.userRepository.findUserById(decodedUser.userId);

        if (!user) {
            this.logger.logError("Invalid or expired token");
            throw new UnAuthorizedAccessException(
                HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE,
                "Unauthorized Access"
            );
        }

        req.body.user = user;
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

        const user = await this.userRepository.findUserById(decodedUser.userId);
        if (!user) {
            this.logger.logError("Invalid or expired token");
            return await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                message: "Unauthorized Access"
            });
        }

        if (!user.isAdmin) {
            return await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                message: "Unauthorized Access"
            });
        }

        req.body.user = user;
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

        const user = await this.userRepository.findUserById(decodedUser.userId);

        if (!user) {
            return await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
                message: "Invalid token"
            });
        }

        req.body.resetPasswordUser = user;
        next();
    });

}
