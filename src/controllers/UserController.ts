import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { UserSchema } from "../schema/UserSchema";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { UserMapper } from "../mappers/UserMapper";
import { UserRegisterRequestModel } from "../models/UserHttpModels/UserRegisterRequestModel";
import { JwtAuthentication } from "../utils/JwtAuthentication";
import { UserLoginRequestModel } from "../models/UserHttpModels/UserLoginRequestModel";
import { UserResponseModel } from "../models/UserHttpModels/UserResponseModel";
import { UserDao } from "../dao/UserDao";
import { UserRequestModel } from "../models/UserHttpModels/UserRequestModel";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { UserPasswordUpdateRequest } from "../models/UserHttpModels/UserPasswordUpdateRequest";
import { UserResetPasswordModel } from "../models/UserHttpModels/UserResetPasswordModel";


export class UserController extends UserDao {

	private logger: ApplicationLogger;
	private userMapper: UserMapper;

	constructor() {
		super();
		this.logger = new ApplicationLogger();
		this.userMapper = new UserMapper();
	}

	/*
	* GET/ all-users/
	* Admin Access
	*/
	public getAllUsers = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userDao) {
				const users = await this.userDao.find();
				if (users.length === 0) {
					this.logger.logInfo("No users found");
					res.status(HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS)
						.json({ users });
				} else {
					this.logger.logInfo(`Found ${users.length} users`);
					const userResponse: UserResponseModel[] = await this.userMapper.mapToUserResponseArray(users);
					res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
						.json({ users: userResponse });
				}
			} else {
				this.logger.logError("User repository not found");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User repository not found" });
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ message: error.message });
		}
	}

	/*
	* GET/ current-user/
	* Authenticated Access
	*/
	public getCurrentUser = async (req: Request, res: Response): Promise<void> => {
		try {
			if (req.body.user) {
				this.logger.logInfo("Getting logged in user");
				const user = req.body.user as UserSchema;

				const userResponse = await this.userMapper.mapToUserResponse(user);
				res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
					.json({ user: userResponse });
			} else {
				this.logger.logError("User not found");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "Please login" });
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ message: error.message });

		}
	}

	/*
	* POST/ create-user/
	* Non Authenticated Access
	*/
	public registerUser = async (req: Request, res: Response): Promise<void> => {
		try {
			if (this.userDao) {
				const userReq = req.body as UserRegisterRequestModel;

				const existingUser = await this.userDao.findOne({
					where: { username: userReq.userName }
				});
				if (existingUser) {
					this.logger.logError("Username already exists. Please choose a different username");
					res.status(HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE).json({
						message: "Username already exists. Please choose a different username.",
					});
					return;
				}

				res.clearCookie("auth_token");

				const user: UserSchema = await this.userMapper.toUserEntity(userReq);
				const savedUser = await this.userDao.save(user);

				if (savedUser) {
					const token = await JwtAuthentication.generateToken(savedUser.userId);
					res.cookie("auth_token", token, {
						httpOnly: true,
						secure: false, // Set to true in production
						maxAge: 3600000, // 1 hour
						sameSite: "strict",
					});

					const userResponse = await this.userMapper.mapToUserResponse(user);
					this.logger.logInfo(`User ${savedUser.username} registered successfully`);
					res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
						.json({ user: userResponse });
				} else {
					this.logger.logError("User registration failed");
					res.status(HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE)
						.json({ message: "User registration failed" });
				}
			} else {
				this.logger.logError("User repository not found");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User repository not found" });
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
			if (this.userDao) {
				const userReq = req.body as UserLoginRequestModel;

				const user = await this.userDao.createQueryBuilder("user")
					.where("LOWER(user.username) = LOWER(:username)", { username: userReq.userName })
					.getOne();

				if (!user) {
					this.logger.logError("User not found");
					res.clearCookie("auth_token");
					res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
						.json({ message: "Invalid username" });
					return;
				}

				const isPasswordValid = await bcrypt.compare(userReq.password, user.password);
				if (!isPasswordValid) {
					this.logger.logError("Invalid Password");
					res.clearCookie("auth_token");
					res.status(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE)
						.json({ message: "Invalid Password" });
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
				res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
					.json({ user: userResponse });
			} else {
				this.logger.logError("User repository not found");
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ message: "User repository not found" });
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
			if (this.userDao) {
				const userReq = req.body as UserRequestModel;
				const user = req.body.user as UserSchema;

				user.firstName = userReq.firstName;
				user.lastName = userReq.lastName;
				user.age = userReq.age;
				user.emailId = userReq.emailId;
				user.updatedAt = new Date();

				const updatedUser = await this.userDao.save(user);
				const userResponse = await this.userMapper.mapToUserResponse(updatedUser);

				this.logger.logInfo("User details updated successfully")
				res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
					.json({ user: userResponse });
			}
			else {
				res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
					.json({ error: "UserDao not autowired" });
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
			if (this.userDao) {
				const passwordChangeReq = req.body as UserPasswordUpdateRequest;
				const user = req.body.user as UserSchema;

				const isPasswordValid = await bcrypt.compare(passwordChangeReq.oldPassword, user.password);
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

				user.password = await bcrypt.hash(passwordChangeReq.newPassword || "", 10);
				user.updatedAt = new Date();
				await this.userDao.save(user);

				const userResponse: UserResponseModel = await this.userMapper.mapToUserResponse(user);
				this.logger.logInfo("Password Updated Successfully")
				res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
					.json({ user: userResponse });
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
			if (this.userDao) {
				const userEmailId: string = req.body.emailId;
				const user = await this.userDao.findOne({ where: { emailId: userEmailId } });

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
			if (this.userDao) {
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

				const isPasswordSame = await bcrypt.compare(passwordResetReq.newPassword, user.password);
				if (isPasswordSame) {
					this.logger.logWarn("Please enter a new password")
					res.status(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE)
						.json({ warning: "Please enter a new password" });
					return;
				}

				user.password = await bcrypt.hash(passwordResetReq.newPassword || "", 10);
				user.updatedAt = new Date();
				await this.userDao.save(user);
				res.clearCookie("auth_token");

				const userResponse: UserResponseModel = await this.userMapper.mapToUserResponse(user);
				this.logger.logInfo("Password Updated Successfully")
				res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
					.json({
						message: "Password reset successfull, Please login again",
						user: userResponse
					});
			}
		} catch (error: any) {
			this.logger.logError(error.message);
			res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
				.json({ error: error.message });
		}
	}

}