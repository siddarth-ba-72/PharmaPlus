import { Request, Response } from "express";
import { UserResponseModel } from "../models/UserHttpModels/UserResponseModel";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { UserService } from "../services/UserService";
import { UserRegisterRequestModel } from "../models/UserHttpModels/UserRegisterRequestModel";
import { UserLoginRequestModel } from "../models/UserHttpModels/UserLoginRequestModel";
import { UserRequestModel } from "../models/UserHttpModels/UserRequestModel";
import { UserPasswordUpdateRequest } from "../models/UserHttpModels/UserPasswordUpdateRequest";
import { UserResetPasswordModel } from "../models/UserHttpModels/UserResetPasswordModel"
import { AbstractController } from "./AbstractController";

export class UserController extends AbstractController {

	private userService: UserService;

	constructor() {
		super();
		this.userService = new UserService();
	}

	/*
	* GET/ all-users/
	* Admin Access
	*/
	public getAllUsers = async (req: Request, res: Response): Promise<void> => {
		try {
			const users = await this.userService.fetchAllUsers();
			if (users.length === 0) {
				this.logger.logInfo("No users found");
				this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
					message: "No users found",
					users: null
				});
			} else {
				this.logger.logInfo(`Found ${users.length} users`);
				this.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
					users
				});
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

	/*
	* GET/ current-user/
	* Authenticated Access
	*/
	public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
		try {
			this.logger.logInfo("Getting logged in user");
			const user = await this.userService.fetchCurrentLoggedInUser(req);
			if (!user || user === null) {
				this.logger.logError("User not found");
				this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
					message: "User not found"
				});
			}
			return await this.httpResponse.sendHttpResponse(res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
				user
			});
		} catch (error: any) {
			this.logger.logError(error.message);
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

	/*
	* POST/ create-user/
	* Non Authenticated Access
	*/
	public registerUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const userReq = req.body as UserRegisterRequestModel;
			const existingUser = await this.userService.findIfUserExistsByUserName(userReq);
			if (existingUser) {
				this.logger.logError("Username already exists. Please choose a different username");
				this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE, {
					message: "Username already exists. Please choose a different username."
				});
			}
			const userResponse = await this.userService.createUser(userReq, res);
			if (!userResponse) {
				this.logger.logError("User registration failed");
				this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE, {
					message: "User registration failed",
				});
			}
			this.logger.logInfo(`User ${userResponse.username} registered successfully`);
			this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: `User ${userResponse.username} registered successfully`,
				user: userResponse
			});
		} catch (error: any) {
			this.logger.logError(error.message);
			this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

	/*
	* POST/ login-user/
	* Non Authenticated Access
	*/
	public loginUser = async (req: Request, res: Response): Promise<void> => {
		try {
			const user = await this.userService.loginInUser(req.body as UserLoginRequestModel, res);
			this.logger.logInfo(`User ${user.username} logged in successfully`);
			return await this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: `User ${user.username} logged in successfully`,
				user
			});
		} catch (error: any) {
			this.logger.logError(error.message);
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

	/*
	* GET/ logout/
	* Non Authenticated Access
	*/
	public logOutUser = async (req: Request, res: Response): Promise<void> => {
		try {
			this.userService.logoutUser(res);
			this.logger.logInfo("User logged out successfully");
			return await this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
				message: "User logged out successfully"
			}
			);
		} catch (error: any) {
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

	/*
	* PUT/ update-user/
	* Authenticated Access
	*/
	public updateUserDetails = async (req: Request, res: Response): Promise<void> => {
		try {
			const userReq = req.body as UserRequestModel;
			const updatedUser = await this.userService.updateUserDetails(userReq);
			this.logger.logInfo("User details updated successfully")
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: "User details updated successfully",
				updatedUser
			});
		} catch (error: any) {
			this.logger.logError(error.message);
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

	/*
	* PUT/ change-password/
	* Authenticated Access
	*/
	public updateUserPassword = async (req: Request, res: Response): Promise<void> => {
		try {
			const passwordChangeReq = req.body as UserPasswordUpdateRequest;
			const updatedUser: UserResponseModel = await this.userService.updateUserPassword(req, passwordChangeReq);
			this.logger.logInfo("Password Updated Successfully")
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: `Password updated successfully for user ${updatedUser.username}`,
				updatedUser
			});
		} catch (error: any) {
			this.logger.logError(error.message);
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

	/*
	* GET/ forgot-password/
	* Non Authenticated Access
	*/
	public forgotPassword = async (req: Request, res: Response): Promise<void> => {
		try {
			const token = this.userService.processForgotPassword(req, res);
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
				message: `Password reset token generated successfully`,
				reset_password_token: token
			});
		} catch (error: any) {
			this.logger.logError(error.message);
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

	/*
	* PUT/ reset-password/
	* Non Authenticated Access
	*/
	public resetPassword = async (req: Request, res: Response): Promise<void> => {
		try {
			const passwordResetReq = req.body as UserResetPasswordModel;
			const updatedUser: UserResponseModel = await this.userService.processResetPassword(req, passwordResetReq, res);
			this.logger.logInfo("Password Updated Successfully")
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: `Password reset successfully for user ${updatedUser.username}, Please login again`,
				updatedUser
			});
		} catch (error: any) {
			this.logger.logError(error.message);
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
				message: "Something went wrong!",
			});
		}
	}

}