import bcrypt from 'bcryptjs';
import { UserDao } from "../dao/UserDao";
import { UserSchema } from "../schema/UserSchema";
import { UserRequestModel } from "../models/UserHttpModels/UserRequestModel";
import { UserRegisterRequestModel } from "../models/UserHttpModels/UserRegisterRequestModel";
import { UserMapper } from "../mappers/UserMapper";
import { UserDaoRepository } from "../repository/UserDaoRepository";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { UserResponseModel } from "../models/UserHttpModels/UserResponseModel";
import { Request, Response } from "express";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { UserLoginRequestModel } from "../models/UserHttpModels/UserLoginRequestModel";
import { BadRequestException, ResourceNotFoundException } from "../exceptions/CustomExceptions";
import { UserPasswordUpdateRequest } from "../models/UserHttpModels/UserPasswordUpdateRequest";
import { UserResetPasswordModel } from '../models/UserHttpModels/UserResetPasswordModel';

export class UserService {

    private userRepository: UserDao;
    private userMapper: UserMapper;

    constructor() {
        this.userRepository = new UserDaoRepository();
        this.userMapper = new UserMapper();
    }

    public async fetchAllUsers(): Promise<UserResponseModel[]> {
        const users: UserSchema[] = await this.userRepository.findAllUsers();
        return await this.userMapper.mapToUserResponseArray(users);
    }

    public async fetchLoggedInUser(request: Request): Promise<UserSchema> {
        const user: UserSchema | null = request.body.user as UserSchema;
        if (!user) {
            throw new ResourceNotFoundException(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, "User not found");
        }
        return user;
    }

    public async fetchCurrentLoggedInUser(request: Request): Promise<UserResponseModel | null> {
        const user: UserResponseModel | null = request.body.user as UserResponseModel;
        if (!user) {
            return null;
        }
        return user;
    }

    public async findIfUserExistsByUserName(userRequest: UserRegisterRequestModel): Promise<Boolean> {
        const user = await this.userRepository.findUserByUserName(userRequest.userName);
        return user !== null;
    }

    public async createUser(userRequest: UserRegisterRequestModel, res: Response): Promise<UserResponseModel> {
        res.clearCookie("auth_token");
        const savedUser = await this.userRepository.addUser(userRequest);
        if (!savedUser) {
            throw new BadRequestException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "User registration failed");
        }
        const token = await JwtAuthentication.generateToken(savedUser);
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: false, // Set to true in production
            maxAge: 3600000, // 1 hour
            sameSite: "strict",
        });
        return await this.userMapper.mapToUserResponse(savedUser);
    }

    public async loginInUser(userRequest: UserLoginRequestModel, res: Response): Promise<UserResponseModel> {
        const user = await this.userRepository.findUserByUserName(userRequest.userName);
        if (!user) {
            throw new ResourceNotFoundException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "User not found");
        }
        const isPasswordValid = await this.isValidPassword(userRequest.password, user.password);
        if (!isPasswordValid) {
            throw new ResourceNotFoundException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "Invalid password");
        }
        res.clearCookie("auth_token");
        const token = await JwtAuthentication.generateToken(user);
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: false, // Set to true in production
            maxAge: 3600000, // 1 hour
            sameSite: "strict",
        });
        return await this.userMapper.mapToUserResponse(user);
    }

    public async logoutUser(res: Response): Promise<void> {
        res.clearCookie("auth_token");
    }

    public async updateUserDetails(userRequest: UserRequestModel, currentUser: UserResponseModel, res: Response): Promise<UserResponseModel> {
        const userName: string = currentUser.username;
        const user = await this.userRepository.findUserByUserName(userName);
        if (!user) {
            throw new ResourceNotFoundException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "User not found");
        }
        const updatedUser = await this.userRepository.updateUserDetails(user, userRequest);
        const refreshedToken = await JwtAuthentication.generateToken(updatedUser);
        res.cookie("auth_token", refreshedToken, {
            httpOnly: true,
            secure: false,
            maxAge: 3600000,
            sameSite: "strict",
        });
        return await this.userMapper.mapToUserResponse(updatedUser);
    }

    public async updateUserPassword(req: Request, passwordUpdateRequest: UserPasswordUpdateRequest): Promise<UserResponseModel> {
        const user = await this.userRepository.findUserByUserName(req.body.user?.username);
        if (!user) {
            throw new ResourceNotFoundException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "User not found");
        }
        const isPasswordValid = await this.isValidPassword(passwordUpdateRequest.oldPassword, user.password);
        if (!isPasswordValid) {
            throw new BadRequestException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "Incorrect Password");
        }
        if (passwordUpdateRequest.newPassword === passwordUpdateRequest.oldPassword) {
            throw new BadRequestException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "New password cannot be the same as old password");
        }
        if (passwordUpdateRequest.newPassword !== passwordUpdateRequest.confirmPassword) {
            throw new BadRequestException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "Passwords do not match");
        }
        const updatedUser: UserSchema = await this.userRepository.updateUserPassword(user, passwordUpdateRequest.newPassword);
        return await this.userMapper.mapToUserResponse(updatedUser);
    }

    public async processForgotPassword(req: Request, res: Response): Promise<string> {
        const user = await this.userRepository.findUserByEmailId(req.body.emailId);
        if (!user) {
            throw new ResourceNotFoundException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "User not found");
        }
        const token = await JwtAuthentication.generateResetPasswordToken(user);
        res.cookie("reset_password_token", token, {
            httpOnly: true,
            secure: false,
            maxAge: 15 * 60 * 1000, // 15 mins
            sameSite: "strict",
        });
        return token;
    }

    public async processResetPassword(req: Request, passwordResetReq: UserResetPasswordModel, res: Response): Promise<UserResponseModel> {
        const jwtUser: UserResponseModel = req.body.resetPasswordUser;
        if (!jwtUser) {
            throw new BadRequestException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "Cannot validate the token");
        }
        const user = await this.userRepository.findUserByUserName(jwtUser.username);
        if (!user) {
            throw new BadRequestException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "User not found");
        }
        const isPasswordSame = await this.isValidPassword(passwordResetReq.newPassword, user.password);
        if (isPasswordSame) {
            throw new BadRequestException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "Please enter a new password");
        }
        const updatedUser: UserSchema = await this.userRepository.updateUserPassword(user, passwordResetReq.newPassword);
        res.clearCookie("auth_token");
        return await this.userMapper.mapToUserResponse(updatedUser);
    }

    private async isValidPassword(requestedPassword: string, userPassword: string): Promise<Boolean> {
        return await bcrypt.compare(requestedPassword, userPassword);
    }

}
