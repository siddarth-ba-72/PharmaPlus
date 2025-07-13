import { NextFunction, Request, Response } from "express";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { DataSource, Repository } from "typeorm";
import { UserSchema } from "../schema/UserSchema";
import DatabaseConnectionConfig from "../config/DatabaseConnectionConfig";
import HttpResponseMiddleware from "./HttpResponseMiddleware";

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
            await this.httpResponse.getRetrievedSuccessResponse(res, { message: "User already logged in" });
            return;
        }
        next();
    }

    public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authToken = req.cookies.auth_token;
            if (!authToken) {
                await this.httpResponse.getForbiddenFailureResponse(res, "Unauthorized Access");
                return;
            }
            const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
            if (!decodedUser) {
                await this.httpResponse.getForbiddenFailureResponse(res, "Unauthorized Access");
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                await this.httpResponse.getForbiddenFailureResponse(res, "Unauthorized Access");
                return;
            }

            req.body.user = user;
            next();
        } catch (error: any) {
            await this.httpResponse.getServerErrorFailureResponse(res, error.message);
            return;
        }
    }

    public authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authToken = req.cookies.auth_token;
            if (!authToken) {
                await this.httpResponse.getForbiddenFailureResponse(res, "Unauthorized Access");
                return;
            }

            const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
            if (!decodedUser) {
                await this.httpResponse.getForbiddenFailureResponse(res, "Unauthorized Access");
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                await this.httpResponse.getNotFoundFailureResponse(res, "No user found with this token");
                return;
            }

            if (!user.isAdmin) {
                await this.httpResponse.getForbiddenFailureResponse(res, "Access Denied: Admins only");
                return;
            }

            req.body.user = user;
            next();
        } catch (error: any) {
            await this.httpResponse.getServerErrorFailureResponse(res, error.message);
            return;
        }
    }

    public checkResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const resetPasswordToken = req.cookies.reset_password_token;
        if (!resetPasswordToken) {
            await this.httpResponse.getForbiddenFailureResponse(res, "Unauthorized Access");
            return;
        }

        try {
            const decodedUser: any = JSON.parse(await JwtAuthentication.verifyPasswordToken(resetPasswordToken));
            if (!decodedUser) {
                await this.httpResponse.getForbiddenFailureResponse(res, "Unauthorized Access");
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                await this.httpResponse.getNotFoundFailureResponse(res, "Invalid token");
                return;
            }

            req.body.resetPasswordUser = user;
            next();
        } catch (error: any) {
            await this.httpResponse.getServerErrorFailureResponse(res, error.message);
            return;
        }
    }

}
