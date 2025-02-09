import { NextFunction, Request, Response } from "express";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { DataSource, Repository } from "typeorm";
import { UserSchema } from "../schema/UserSchema";
import DatabaseConnection from "./DatabaseConnection";

export class AuthenticationMiddleware {
    private dataSource: DataSource;
    private userRepository: Repository<UserSchema>;

    constructor() {
        this.dataSource = DatabaseConnection.getInstance().getDataSource();
        this.userRepository = this.dataSource.getRepository(UserSchema);
    }

    public checkIsNotLoggedIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (authToken) {
            res.status(200)
                .json({ message: "User already logged in" });
            return;
        }
        next();
    }

    public authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (!authToken) {
            res.status(403).json({ message: "Unauthorized Access" });
            return;
        }

        try {
            const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
            if (!decodedUser) {
                res.status(403).json({ message: "Unauthorized Access" });
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                res.status(404).json({ message: "Invalid Token" });
                return;
            }

            req.body.user = user;
            next();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
            return;
        }
    }

    public authenticateAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authToken = req.cookies.auth_token;
        if (!authToken) {
            res.status(403).json({ message: "Unauthorized Access" });
            return;
        }

        try {
            const decodedUser: any = JSON.parse(await JwtAuthentication.verify(authToken));
            if (!decodedUser) {
                res.status(403).json({ message: "Unauthorized Access" });
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                res.status(404).json({ message: "Invalid Token" });
                return;
            }

            if (!user.isAdmin) {
                res.status(403).json({ message: "Admin Access only" });
                return;
            }

            req.body.user = user;
            next();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
            return;
        }
    }

    public checkResetToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const resetPasswordToken = req.cookies.reset_password_token;
        if (!resetPasswordToken) {
            res.status(403).json({ message: "Unauthorized Access" });
            return;
        }

        try {
            const decodedUser: any = JSON.parse(await JwtAuthentication.verifyPasswordToken(resetPasswordToken));
            if (!decodedUser) {
                res.status(403).json({ message: "Unauthorized Access" });
                return;
            }

            const user = await this.userRepository.findOne({
                where: { userId: decodedUser.userId },
            });

            if (!user) {
                res.status(404).json({ message: "Invalid Token" });
                return;
            }

            req.body.resetPasswordUser = user;
            next();
        } catch (error: any) {
            res.status(500).json({ message: error.message });
            return;
        }
    }

}
