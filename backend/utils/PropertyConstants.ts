import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export class PropertyConstants {

    public static readonly DATABASE_URL: string = process.env.DATABASE_URL || "dummy_database_url";
    public static readonly DATABASE_HOST: string = process.env.DATABASE_HOST || "dummy_host";
    public static readonly DATABASE_PORT: number = parseInt(process.env.DATABASE_PORT || "0000");
    public static readonly DATABASE_USERNAME: string = process.env.DATABASE_USERNAME || "dummy_username";
    public static readonly DATABASE_PASSWORD: string = process.env.DATABASE_PASSWORD || "dummy_password";
    public static readonly DATABASE_SCHEMA: string = process.env.DATABASE_SCHEMA || "dummy_schema";
    public static readonly WEB_HOST: string = process.env.WEB_HOST || "dummy_web_host";
    public static readonly WEB_PORT: number = parseInt(process.env.WEB_PORT || "0000");
    public static readonly JWT_SECRET: string = process.env.JWT_SECRET || "dummy_jwt_secret";
    public static readonly JWT_PASSWORD_SECRET: string = process.env.JWT_PASSWORD_SECRET || "dummy_password_secret";

}