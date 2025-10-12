import { UserRegisterRequestModel } from "../models/UserHttpModels/UserRegisterRequestModel";
import { UserResponseModel } from "../models/UserHttpModels/UserResponseModel";
import { UserSchema } from "../schema/UserSchema";
import bcrypt from "bcryptjs";

export class UserMapper {

    public async toUserEntity(requestModel: UserRegisterRequestModel): Promise<UserSchema> {
        const userEntity = new UserSchema();
        userEntity.username = requestModel.userName;
        userEntity.firstName = requestModel.firstName;
        userEntity.lastName = requestModel.lastName;
        userEntity.emailId = requestModel.emailId;
        userEntity.age = requestModel.age;
        userEntity.password = await bcrypt.hash(requestModel.password || "", 10);
        return userEntity;
    }

    public async mapToUserResponse(user: UserSchema): Promise<UserResponseModel> {
        const userResponse = new UserResponseModel();
        userResponse.username = user.username;
        userResponse.firstName = user.firstName;
        userResponse.lastName = user.lastName;
        userResponse.emailId = user.emailId;
        return userResponse;
    }

    public async mapToUserResponseArray(users: UserSchema[]): Promise<UserResponseModel[]> {
        const userResponseArray: UserResponseModel[] = [];
        for (const user of users) {
            userResponseArray.push(await this.mapToUserResponse(user));
        }
        return userResponseArray;
    }

}
