import { format as formatSql } from "sql-formatter";
import { Logger, QueryRunner } from "typeorm";
import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(__dirname, "../logs");
fs.mkdirSync(logDir, { recursive: true });

const queryLogger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
            return `[${level.toUpperCase()}] ${timestamp} - ${message}`;
        })
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDir, "debug.log") }),
        new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" })
    ]
});

export class QueryLogger implements Logger {

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner): void {
        const formattedQuery = formatSql(query, { language: "postgresql" });
        queryLogger.info(`Executed Query:\n${formattedQuery}`);
        if (parameters && parameters.length > 0) {
            queryLogger.info(`With Parameters:\n${JSON.stringify(parameters, null, 2)}`);
        }
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
        const formattedQuery = formatSql(query, { language: "postgresql" });
        queryLogger.error(`Query Failed:\n${formattedQuery}`);
        queryLogger.error(`Error:\n${error}`);
        if (parameters && parameters.length > 0) {
            queryLogger.error(`With Parameters:\n${JSON.stringify(parameters, null, 2)}`);
        }
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner): void {
        const formattedQuery = formatSql(query, { language: "postgresql" });
        queryLogger.warn(`Slow Query (${time}ms):\n${formattedQuery}`);
        if (parameters && parameters.length > 0) {
            queryLogger.warn(`With Parameters:\n${JSON.stringify(parameters, null, 2)}`);
        }
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner): void {
        queryLogger.info(`Schema Build:\n${message}`);
    }

    logMigration(message: string, queryRunner?: QueryRunner): void {
        queryLogger.info(`Migration:\n${message}`);
    }

    log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner): void {
        queryLogger.log(level, message);
    }
}
