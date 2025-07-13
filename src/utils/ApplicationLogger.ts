import winston from "winston";
import path from "path";
import fs from "fs";

const logDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `[${level.toUpperCase()}] ${timestamp} - ${message}`;
});

const loggerInstance = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
        winston.format.timestamp(),
        fileFormat
    ),
    transports: [
        new winston.transports.File({ filename: path.join(logDir, "error.log"), level: "error" }),
        new winston.transports.File({ filename: path.join(logDir, "debug.log") }),
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
    ]
});

export class ApplicationLogger {

    private getCallerInfo(): string {
        const stack = new Error().stack;
        if (stack) {
            const stackLines = stack.split("\n");
            if (stackLines.length > 3) {
                const callerLine = stackLines[3];
                const callerInfo = callerLine.substring(callerLine.lastIndexOf(" ") + 1).split(/[\\/]/);
                const fileName = callerInfo[callerInfo.length - 1].replace(/[)]/, '');
                return fileName;
            }
        }
        return "unknown";
    }

    private formatMessage(tag: string, message: string): string {
        return `${this.getCallerInfo()} : ${tag} ${message}`;
    }

    logApi(message: string): void {
        const formatted = this.formatMessage("[API]", message);
        loggerInstance.info(formatted);
    }

    logInfo(message: string): void {
        const formatted = this.formatMessage("[INFO]", message);
        loggerInstance.info(formatted);
    }

    logDebug(message: string): void {
        const formatted = this.formatMessage("[DEBUG]", message);
        loggerInstance.debug(formatted);
    }

    logWarn(message: string): void {
        const formatted = this.formatMessage("[WARN]", message);
        loggerInstance.warn(formatted);
    }

    logError(message: string): void {
        const formatted = this.formatMessage("[ERROR]", message);
        loggerInstance.error(formatted);
    }

}