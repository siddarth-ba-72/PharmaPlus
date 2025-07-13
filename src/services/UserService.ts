import { DataSource, Repository } from "typeorm";
import bcrypt from 'bcryptjs';
import { UserDao } from "../dao/UserDao";
import { UserSchema } from "../schema/UserSchema";
import DatabaseConnectionConfig from "../config/DatabaseConnectionConfig";
import { UserRequestModel } from "../models/UserHttpModels/UserRequestModel";
import { UserRegisterRequestModel } from "../models/UserHttpModels/UserRegisterRequestModel";
import { UserMapper } from "../mappers/UserMapper";

export class UserService implements UserDao {

    private dataSource: DataSource;
    private userRepository: Repository<UserSchema>;
    private userMapper: UserMapper;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.userRepository = this.dataSource.getRepository(UserSchema);
        this.userMapper = new UserMapper();
    }

    public async findAllUsers(): Promise<UserSchema[]> {
        return await this.userRepository.find();
    }

    public async findUserByUserName(userName: string): Promise<UserSchema | null> {
        return await this.userRepository.findOne({
            where: {
                username: userName
            }
        });
    }

    public async findUserByEmailId(emailId: string): Promise<UserSchema | null> {
        return await this.userRepository.findOne({
            where: {
                emailId: emailId
            }
        });
    }

    public async findLoggedInUser(req: any): Promise<UserSchema> {
        const user = req.body.user as UserSchema;
        return user;
    }

    public async isValidPassword(requestedPassword: string, userPassword: string): Promise<Boolean> {
        return await bcrypt.compare(requestedPassword, userPassword);
    }

    public async addUser(userRequest: UserRegisterRequestModel): Promise<UserSchema> {
        const user: UserSchema = await this.userMapper.toUserEntity(userRequest);
        return await this.userRepository.save(user);
    }

    public async updateUserDetails(user: UserSchema, updatedUserDetails: UserRequestModel): Promise<UserSchema> {
        user.firstName = updatedUserDetails.firstName;
        user.lastName = updatedUserDetails.lastName;
        user.emailId = updatedUserDetails.emailId;
        user.age = updatedUserDetails.age;
        user.updatedAt = new Date();
        return await this.userRepository.save(user);
    }

    public async updateUserPassword(user: UserSchema, newPassword: string): Promise<UserSchema> {
        user.password = await bcrypt.hash(newPassword || "", 10);
        user.updatedAt = new Date();
        return await this.userRepository.save(user);
    }

}