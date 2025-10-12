import { NextFunction, Request, Response } from "express";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { DataSource, Repository } from "typeorm";
import { UserSchema } from "../schema/UserSchema";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { HttpResponseMiddleware } from "./HttpResponseMiddleware";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { ApplicationLogger } from "../utils/ApplicationLogger";

export class AuthenticationMiddleware {

    private dataSource: DataSource;
    private userRepository: Repository<UserSchema>;
    private httpResponse: HttpResponseMiddleware;
    private logger: ApplicationLogger;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.userRepository = this.dataSource.getRepository(UserSchema);
        this.httpResponse = new HttpResponseMiddleware();
        this.logger = new ApplicationLogger();
    }

    public checkIsNotLoggedIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (authToken) {
            this.logger.logInfo("User already logged in");
            await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                message: "User already logged in"
            });
        }
        next();
    }

    public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authToken = req.cookies.auth_token;
            if (!authToken) {
                this.logger.logError("Invalid or expired token");
                return await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                    message: "Unauthorized Access"
                });
            }
            const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
            if (!decodedUser) {
                this.logger.logError("Invalid or expired token");
                return await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                    message: "Unauthorized Access"
                });
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                this.logger.logError("Invalid or expired token");
                return await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                    message: "Unauthorized Access"
                });
            }

            req.body.user = user;
            next();
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

    public authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
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

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

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
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

    public checkResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const resetPasswordToken = req.cookies.reset_password_token;
        if (!resetPasswordToken) {
            return await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                message: "Unauthorized Access"
            });
        }

        try {
            const decodedUser: any = JSON.parse(await JwtAuthentication.verifyPasswordToken(resetPasswordToken));
            if (!decodedUser) {
                return await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, {
                    message: "Unauthorized Access"
                });
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                return await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
                    message: "Invalid token"
                });
            }

            req.body.resetPasswordUser = user;
            next();
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

}
