import { Request, Response } from "express";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { UserMapper } from "../mappers/UserMapper";
import { UserResponseModel } from "../models/UserHttpModels/UserResponseModel";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { UserService } from "../services/UserService";
import { UserSchema } from "../schema/UserSchema";
import { UserRegisterRequestModel } from "../models/UserHttpModels/UserRegisterRequestModel";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { UserLoginRequestModel } from "../models/UserHttpModels/UserLoginRequestModel";
import { UserRequestModel } from "../models/UserHttpModels/UserRequestModel";
import { UserPasswordUpdateRequest } from "../models/UserHttpModels/UserPasswordUpdateRequest";
import { UserResetPasswordModel } from "../models/UserHttpModels/UserResetPasswordModel";
import { HttpResponseMiddleware } from "../middlewares/HttpResponseMiddleware";

export class UserController {

	private userService: UserService;
	private userMapper: UserMapper;
	private logger: ApplicationLogger;
	private httpResponse: HttpResponseMiddleware;

	constructor() {
		this.userService = new UserService();
		this.userMapper = new UserMapper();
		this.logger = new ApplicationLogger();
		this.httpResponse = new HttpResponseMiddleware();
	}

	/*
	* GET/ all-users/
	* Admin Access
	*/
	public getAllUsers = async (req: Request, res: Response): Promise<void> => {
		try {
			const users = await this.userService.findAllUsers();
			if (users.length === 0) {
				this.logger.logInfo("No users found");
				return await this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
					message: "No users found",
					users: null
				});
			} else {
				this.logger.logInfo(`Found ${users.length} users`);
				const userResponse: UserResponseModel[] = await this.userMapper.mapToUserResponseArray(users);
				return await this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
					users: userResponse
				});
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			return this.httpResponse.sendHttpResponse(
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
			const user = await this.userService.findLoggedInUser(req);
			if (!user) {
				this.logger.logError("User not found");
				return await this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
					message: "User not found"
				});
			}
			const userResponse = await this.userMapper.mapToUserResponse(user);
			return await this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
				user: userResponse
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
			const existingUser = await this.userService.findUserByUserName(userReq.userName);
			if (existingUser) {
				this.logger.logError("Username already exists. Please choose a different username");
				return await this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE, {
					message: "Username already exists. Please choose a different username."
				});
			}
			res.clearCookie("auth_token");
			const savedUser = await this.userService.addUser(userReq);
			if (savedUser) {
				const token = await JwtAuthentication.generateToken(savedUser.userId);
				res.cookie("auth_token", token, {
					httpOnly: true,
					secure: false, // Set to true in production
					maxAge: 3600000, // 1 hour
					sameSite: "strict",
				});
				const userResponse = await this.userMapper.mapToUserResponse(savedUser);
				this.logger.logInfo(`User ${savedUser.username} registered successfully`);
				return await this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
					message: `User ${savedUser.username} registered successfully`,
					user: userResponse
				});
			} else {
				this.logger.logError("User registration failed");
				return await this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE, {
					message: "User registration failed",
				});
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			return this.httpResponse.sendHttpResponse(
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
			const userReq = req.body as UserLoginRequestModel;
			const user = await this.userService.findUserByUserName(userReq.userName);
			if (!user) {
				this.logger.logError("User not found");
				res.clearCookie("auth_token");
				return await this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
					message: "Invalid Username",
				});
			}
			const isPasswordValid = await this.userService.isValidPassword(userReq.password, user.password);
			if (!isPasswordValid) {
				this.logger.logError("Invalid Password");
				res.clearCookie("auth_token");
				return await this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, {
					message: "Invalid Password",
				});
			}
			res.clearCookie("auth_token");
			const token = await JwtAuthentication.generateToken(user.userId);
			res.cookie("auth_token", token, {
				httpOnly: true,
				secure: false, // Set to true in production
				maxAge: 3600000, // 1 hour
				sameSite: "strict",
			});
			const userResponse = await this.userMapper.mapToUserResponse(user);
			this.logger.logInfo(`User ${user.username} logged in successfully`);
			return await this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: `User ${user.username} logged in successfully`,
				user: userResponse
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
			res.clearCookie("auth_token");
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
			const user = await this.userService.findLoggedInUser(req);
			if (!user) {
				this.logger.logError("User not found");
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
					message: "User not found",
				});
			}
			const updatedUser = await this.userService.updateUserDetails(user, userReq);
			const userResponse = await this.userMapper.mapToUserResponse(updatedUser);
			this.logger.logInfo("User details updated successfully")
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: "User details updated successfully",
				user: userResponse
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
			const user = await this.userService.findLoggedInUser(req);
			if (!user) {
				this.logger.logError("User not found");
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
					message: "User not found"
				});
			}
			const isPasswordValid = await this.userService.isValidPassword(passwordChangeReq.oldPassword, user.password);
			if (!isPasswordValid) {
				this.logger.logError("Invalid Password");
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, {
					message: "Please enter the correct password"
				});
			}
			if (passwordChangeReq.newPassword === passwordChangeReq.oldPassword) {
				this.logger.logWarn("Please provide different password")
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, {
					message: "Please enter a different password"
				});
			}
			if (passwordChangeReq.newPassword !== passwordChangeReq.confirmPassword) {
				this.logger.logWarn("Please enter the new password twice correctly")
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, {
					message: "Passwords do not match"
				});
			}
			const updatedUser: UserSchema = await this.userService.updateUserPassword(user, passwordChangeReq.newPassword);
			const userResponse: UserResponseModel = await this.userMapper.mapToUserResponse(updatedUser);
			this.logger.logInfo("Password Updated Successfully")
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: `Password updated successfully for user ${user.username}`,
				user: userResponse
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
			const userEmailId: string = req.body.emailId;
			const user = await this.userService.findUserByEmailId(userEmailId);
			if (!user) {
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
					message: "Invalid Email Id"
				});
			}
			const token = await JwtAuthentication.generateResetPasswordToken(user.userId);
			res.cookie("reset_password_token", token, {
				httpOnly: true,
				secure: false,
				maxAge: 15 * 60 * 1000, // 15 mins
				sameSite: "strict",
			});
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
				message: `Password reset token generated successfully for user ${user.username}`,
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
			const user = req.body.resetPasswordUser;
			if (!user) {
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
					message: "Cannot validate the token"
				});
			}
			const passwordResetReq = req.body as UserResetPasswordModel;
			if (passwordResetReq.newPassword !== passwordResetReq.confirmPassword) {
				this.logger.logWarn("Please enter the new password twice correctly")
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, {
					message: "Passwords do not match"
				});
			}
			const isPasswordSame = await this.userService.isValidPassword(passwordResetReq.newPassword, user.password);
			if (isPasswordSame) {
				this.logger.logWarn("Please enter a new password")
				return this.httpResponse.sendHttpResponse(
					res, HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, {
					message: "Please enter a new password"
				});
			}
			const updatedUser: UserSchema = await this.userService.updateUserPassword(user, passwordResetReq.newPassword);
			res.clearCookie("auth_token");
			const userResponse: UserResponseModel = await this.userMapper.mapToUserResponse(updatedUser);
			this.logger.logInfo("Password Updated Successfully")
			return this.httpResponse.sendHttpResponse(
				res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
				message: `Password reset successfully for user ${updatedUser.username}, Please login again`,
				user: userResponse
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