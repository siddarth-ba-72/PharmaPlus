import { UserSchema } from "../schema/UserSchema";
import { UserRequestModel } from "../models/UserHttpModels/UserRequestModel";
import { UserRegisterRequestModel } from "../models/UserHttpModels/UserRegisterRequestModel";

export interface UserDao {

    findAllUsers(): Promise<UserSchema[]>;

    findUserById(userId: number): Promise<UserSchema | null>;

    findUserByUserName(userName: string): Promise<UserSchema | null>;

    findUserByEmailId(emailId: string): Promise<UserSchema | null>;

    addUser(user: UserRegisterRequestModel): Promise<UserSchema>;

    updateUserDetails(user: UserSchema, updatedUserDetails: UserRequestModel): Promise<UserSchema>;

    updateUserPassword(user: UserSchema, newPassword: string): Promise<UserSchema>;

}