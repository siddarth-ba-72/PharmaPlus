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
import HttpResponseMiddleware from "../middlewares/HttpResponseMiddleware";

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
			if (this.userService) {
				const users = await this.userService.findAllUsers();
				if (users.length === 0) {
					this.logger.logInfo("No users found");
					await this.httpResponse.getNoContentSuccessResponse(res, { message: "No users found" });
				} else {
					this.logger.logInfo(`Found ${users.length} users`);
					const userResponse: UserResponseModel[] = await this.userMapper.mapToUserResponseArray(users);
					await this.httpResponse.getRetrievedSuccessResponse(res, { users: userResponse });
				}
			} else {
				this.logger.logError("User service not autowired properly");
				await this.httpResponse.getNotFoundFailureResponse(res, "User service not autowired properly");
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			await this.httpResponse.getServerErrorFailureResponse(res, error.message);
		}
	}

	/*
	* GET/ current-user/
	* Authenticated Access
	*/
	public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userService) {
				this.logger.logInfo("Getting logged in user");
				const user = await this.userService.findLoggedInUser(req);
				if (!user) {
					this.logger.logError("User not found");
					res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
						.json({ error: "User not found" });
					return;
				}
				const userResponse = await this.userMapper.mapToUserResponse(user);
				await this.httpResponse.getRetrievedSuccessResponse(res, { user: userResponse });
			} else {
				this.logger.logError("User service not autowired properly");
				await this.httpResponse.getNotFoundFailureResponse(res, "User service not autowired properly");
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			await this.httpResponse.getServerErrorFailureResponse(res, error.message);
		}
	}

	/*
	* POST/ create-user/
	* Non Authenticated Access
	*/
	public registerUser = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userService) {
				const userReq = req.body as UserRegisterRequestModel;
				const existingUser = await this.userService.findUserByUserName(userReq.userName);
				if (existingUser) {
					this.logger.logError("Username already exists. Please choose a different username");
					await this.httpResponse.getNotAllowedFailureResponse(res, "Username already exists. Please choose a different username.");
					return;
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
					res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
						.json({ user: userResponse });
				} else {
					this.logger.logError("User registration failed");
					res.status(HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE)
						.json({ message: "User registration failed" });
				}
			} else {
				this.logger.logError("User service not autowired properly");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User service not autowired properly" });
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ message: error.message });
		}
	}

	/*
	* POST/ login-user/
	* Non Authenticated Access
	*/
	public loginUser = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userService) {
				const userReq = req.body as UserLoginRequestModel;
				const user = await this.userService.findUserByUserName(userReq.userName);
				if (!user) {
					this.logger.logError("User not found");
					res.clearCookie("auth_token");
					await this.httpResponse.getNotFoundFailureResponse(res, "Invalid Username");
					return;
				}
				const isPasswordValid = await this.userService.isValidPassword(userReq.password, user.password);
				if (!isPasswordValid) {
					this.logger.logError("Invalid Password");
					res.clearCookie("auth_token");
					await this.httpResponse.getBadRequestFailureResponse(res, "Invalid Password");
					return;
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
				await this.httpResponse.getCreatedSuccessResponse(res, { user: userResponse });
			} else {
				this.logger.logError("User service not autowired properly");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User service not autowired properly" });
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ message: error.message });
		}
	}

	/*
	* GET/ logout/
	* Non Authenticated Access
	*/
	public logOutUser = async (req: Request, res: Response): Promise<void> => {
		res.clearCookie("auth_token");
		res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
			.json({ message: "Logged out successfully" });
	}

	/*
	* PUT/ update-user/
	* Authenticated Access
	*/
	public updateUserDetails = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userService) {
				const userReq = req.body as UserRequestModel;
				const user = await this.userService.findLoggedInUser(req);
				if (!user) {
					this.logger.logError("User not found");
					res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
						.json({ error: "User not found" });
					return;
				}
				const updatedUser = await this.userService.updateUserDetails(user, userReq);
				const userResponse = await this.userMapper.mapToUserResponse(updatedUser);
				this.logger.logInfo("User details updated successfully")
				res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
					.json({ user: userResponse });
			} else {
				this.logger.logError("User service not autowired properly");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User service not autowired properly" });
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ error: error.message });
		}
	}

	/*
	* PUT/ change-password/
	* Authenticated Access
	*/
	public updateUserPassword = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userService) {
				const passwordChangeReq = req.body as UserPasswordUpdateRequest;
				const user = await this.userService.findLoggedInUser(req);
				if (!user) {
					this.logger.logError("User not found");
					res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
						.json({ error: "User not found" });
					return;
				}
				const isPasswordValid = await this.userService.isValidPassword(passwordChangeReq.oldPassword, user.password);
				if (!isPasswordValid) {
					this.logger.logError("Invalid Password");
					res.status(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE)
						.json({ message: "Please enter the correct password" });
					return;
				}
				if (passwordChangeReq.newPassword === passwordChangeReq.oldPassword) {
					this.logger.logWarn("Please provide different password")
					res.status(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE)
						.json({ warning: "Please enter a different password" });
					return;
				}
				if (passwordChangeReq.newPassword !== passwordChangeReq.confirmPassword) {
					this.logger.logWarn("Please enter the new password twice correctly")
					res.status(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE)
						.json({ warning: "Passwords do not match" });
					return;
				}
				const updatedUser: UserSchema = await this.userService.updateUserPassword(user, passwordChangeReq.newPassword);
				const userResponse: UserResponseModel = await this.userMapper.mapToUserResponse(updatedUser);
				this.logger.logInfo("Password Updated Successfully")
				res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
					.json({ user: userResponse });
			} else {
				this.logger.logError("User service not autowired properly");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User service not autowired properly" });
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ error: error.message });
		}
	}

	/*
	* GET/ forgot-password/
	* Non Authenticated Access
	*/
	public forgotPassword = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userService) {
				const userEmailId: string = req.body.emailId;
				const user = await this.userService.findUserByEmailId(userEmailId);
				if (!user) {
					res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
						.json({ error: "Invalid Email Id" });
					return;
				}
				const token = await JwtAuthentication.generateResetPasswordToken(user.userId);
				res.cookie("reset_password_token", token, {
					httpOnly: true,
					secure: false,
					maxAge: 15 * 60 * 1000, // 15 mins
					sameSite: "strict",
				});
				res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
					.json({ reset_password_token: token });
			} else {
				this.logger.logError("User service not autowired properly");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User service not autowired properly" });
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ error: error.message });
		}
	}

	/*
	* PUT/ reset-password/
	* Non Authenticated Access
	*/
	public resetPassword = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userService) {
				const user = req.body.resetPasswordUser;
				if (!user) {
					res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
						.json({ error: "Cannot validate the token" });
					return;
				}
				const passwordResetReq = req.body as UserResetPasswordModel;
				if (passwordResetReq.newPassword !== passwordResetReq.confirmPassword) {
					this.logger.logWarn("Please enter the new password twice correctly")
					res.status(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE)
						.json({ warning: "Passwords do not match" });
					return;
				}
				const isPasswordSame = await this.userService.isValidPassword(passwordResetReq.newPassword, user.password);
				if (isPasswordSame) {
					this.logger.logWarn("Please enter a new password")
					res.status(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE)
						.json({ warning: "Please enter a new password" });
					return;
				}
				const updatedUser: UserSchema = await this.userService.updateUserPassword(user, passwordResetReq.newPassword);
				res.clearCookie("auth_token");
				const userResponse: UserResponseModel = await this.userMapper.mapToUserResponse(updatedUser);
				this.logger.logInfo("Password Updated Successfully")
				res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
					.json({
						message: "Password reset successfull, Please login again",
						user: userResponse
					});
			} else {
				this.logger.logError("User service not autowired properly");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User service not autowired properly" });
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ error: error.message });
		}
	}

}