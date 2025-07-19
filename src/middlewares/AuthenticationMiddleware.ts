import { NextFunction, Request, Response } from "express";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { DataSource, Repository } from "typeorm";
import { UserSchema } from "../schema/UserSchema";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { HttpResponseMiddleware } from "./HttpResponseMiddleware";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";

export class AuthenticationMiddleware {

    private dataSource: DataSource;
    private userRepository: Repository<UserSchema>;
    private httpResponse: HttpResponseMiddleware;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.userRepository = this.dataSource.getRepository(UserSchema);
        this.httpResponse = new HttpResponseMiddleware();
    }

    public checkIsNotLoggedIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (authToken) {
            await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, { message: "User already logged in" });
        }
        next();
    }

    public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authToken = req.cookies.auth_token;
            if (!authToken) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
                );
                return;
            }
            const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
            if (!decodedUser) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
                );
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
                );
                return;
            }

            req.body.user = user;
            next();
        } catch (error: any) {
            await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, error.message
            );
            return;
        }
    }

    public authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authToken = req.cookies.auth_token;
            if (!authToken) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
                );
                return;
            }

            const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
            if (!decodedUser) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
                );
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
                );
                return;
            }

            if (!user.isAdmin) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
                );
                return;
            }

            req.body.user = user;
            next();
        } catch (error: any) {
            await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, error.message
            );
            return;
        }
    }

    public checkResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const resetPasswordToken = req.cookies.reset_password_token;
        if (!resetPasswordToken) {
            await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
            );
            return;
        }

        try {
            const decodedUser: any = JSON.parse(await JwtAuthentication.verifyPasswordToken(resetPasswordToken));
            if (!decodedUser) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE, "Unauthorized Access"
                );
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                await this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, "Invalid token"
                );
                return;
            }

            req.body.resetPasswordUser = user;
            next();
        } catch (error: any) {
            await this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, error.message
            );
            return;
        }
    }

}
