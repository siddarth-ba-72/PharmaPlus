import dotenv from "dotenv";

dotenv.config({ path: "../config/config.env" });

export class PropertyConstants {

    public static readonly DATABASE_HOST: string = process.env.DATABASE_HOST || "localhost";
    public static readonly DATABASE_PORT: number = parseInt(process.env.DATABASE_PORT || "5432");
    public static readonly DATABASE_USERNAME: string = process.env.DATABASE_USERNAME || "siddarth";
    public static readonly DATABASE_PASSWORD: string = process.env.DATABASE_PASSWORD || "Plsqlmp7236$#";
    public static readonly DATABASE_SCHEMA: string = process.env.DATABASE_SCHEMA || "pharma_plus";
    public static readonly WEB_HOST: string = process.env.WEB_HOST || "localhost";
    public static readonly WEB_PORT: number = parseInt(process.env.WEB_PORT || "7236");
    public static readonly JWT_SECRET: string = process.env.JWT_SECRET || "jwt_secret";
    public static readonly JWT_PASSWORD_SECRET: string = process.env.JWT_PASSWORD_SECRET || "qwertyuiop";

}