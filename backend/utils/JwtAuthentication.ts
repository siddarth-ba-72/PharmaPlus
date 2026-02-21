import jwt from 'jsonwebtoken';
import { PropertyConstants } from './PropertyConstants';
import { UserSchema } from '../schema/UserSchema';
import { UserResponseModel } from '../models/UserHttpModels/UserResponseModel';

export class JwtAuthentication {

    public static async generateToken(user: UserSchema): Promise<string> {
        const payload: UserResponseModel = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            isAdmin: user.isAdmin,
        }
        return jwt.sign(payload, PropertyConstants.JWT_SECRET, { expiresIn: '1h' });
    }

    public static async verify(token: string): Promise<string> {
        const decoded = jwt.verify(token, PropertyConstants.JWT_SECRET);
        if (typeof decoded === 'string') {
            return decoded;
        } else {
            return JSON.stringify(decoded);
        }
    }

    public static async generateResetPasswordToken(user: UserSchema): Promise<string> {
        const payload: UserResponseModel = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            emailId: user.emailId,
            isAdmin: user.isAdmin,
        }
        return jwt.sign(payload, PropertyConstants.JWT_PASSWORD_SECRET, { expiresIn: '15m' });
    }

    public static async verifyPasswordToken(token: string): Promise<string> {
        const decoded = jwt.verify(token, PropertyConstants.JWT_PASSWORD_SECRET);
        if (typeof decoded === 'string') {
            return decoded;
        } else {
            return JSON.stringify(decoded);
        }
    }

}