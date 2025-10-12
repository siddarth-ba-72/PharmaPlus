import jwt from 'jsonwebtoken';
import { PropertyConstants } from './PropertyConstants';

export class JwtAuthentication {

    public static async generateToken(userId: number): Promise<string> {
        return jwt.sign(
            { userId },
            PropertyConstants.JWT_SECRET,
            { expiresIn: '1h' }
        );
    }

    public static async verify(token: string): Promise<string> {
        const decoded = jwt.verify(token, PropertyConstants.JWT_SECRET);
        if (typeof decoded === 'string') {
            return decoded;
        } else {
            return JSON.stringify(decoded);
        }
    }

    public static async generateResetPasswordToken(userId: number): Promise<string> {
        return jwt.sign(
            { userId },
            PropertyConstants.JWT_PASSWORD_SECRET,
            { expiresIn: '15m' }
        );
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