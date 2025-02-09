import { format } from "sql-formatter";
import { Logger, QueryRunner } from "typeorm";

export class QueryLogger implements Logger {

    logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
        const formattedQuery = format(query, { language: "postgresql" });
        console.log("Executed Query:\n", formattedQuery);
        if (parameters) {
            console.log("With Parameters:\n", JSON.stringify(parameters, null, 2), "\n");
        }
    }

    logQueryError(error: string, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        console.error("Query Failed:\n", query);
        console.error("Error:\n", error);
    }

    logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {
        console.warn(`Slow Query (${time}ms):\n`, query);
    }

    logSchemaBuild(message: string, queryRunner?: QueryRunner) {
        console.log("Schema Build:\n", message);
    }

    logMigration(message: string, queryRunner?: QueryRunner) {
        console.log("Migration:\n", message);
    }

    log(level: "log" | "info" | "warn", message: any, queryRunner?: QueryRunner) {
        console[level](message);
    }
}
