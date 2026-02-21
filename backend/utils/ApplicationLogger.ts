import winston from "winston";
import path from "path";
import fs from "fs";

export class ApplicationLogger {

    private loggerInstance: winston.Logger;
    private bannerPath: string;
    private logDir: string;

    constructor() {
        // Log directory setup
        this.logDir = path.join(__dirname, "../logs");
        fs.mkdirSync(this.logDir, { recursive: true });

        // Read and print banner from src/utils/banner.txt
        this.bannerPath = path.join(__dirname, "banner.txt");

        // Logger configuration
        const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
            return `[${level.toUpperCase()}] ${timestamp} - ${message}`;
        });

        this.loggerInstance = winston.createLogger({
            level: "debug",
            format: winston.format.combine(
                winston.format.timestamp(),
                fileFormat
            ),
            transports: [
                new winston.transports.File({ filename: path.join(this.logDir, "error.log"), level: "error" }),
                new winston.transports.File({ filename: path.join(this.logDir, "debug.log") }),
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        });
    }

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

    logBanner(): void {
        try {
            const banner = fs.readFileSync(this.bannerPath, "utf8");
            this.loggerInstance.debug("\n" + banner + "\n");
        } catch (err) {
            this.loggerInstance.debug("");
        }

    }

    private formatMessage(tag: string, message: string): string {
        return `${this.getCallerInfo()} : ${tag} ${message}`;
    }

    logApi(message: string): void {
        const formatted = this.formatMessage("[API]", message);
        this.loggerInstance.info(formatted);
    }

    logInfo(message: string): void {
        const formatted = this.formatMessage("[INFO]", message);
        this.loggerInstance.info(formatted);
    }

    logDebug(message: string): void {
        const formatted = this.formatMessage("[DEBUG]", message);
        this.loggerInstance.debug(formatted);
    }

    logWarn(message: string): void {
        const formatted = this.formatMessage("[WARN]", message);
        this.loggerInstance.warn(formatted);
    }

    logError(message: string): void {
        const formatted = this.formatMessage("[ERROR]", message);
        this.loggerInstance.error(formatted);
    }
}
