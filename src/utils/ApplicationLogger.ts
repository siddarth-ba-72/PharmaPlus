export class ApplicationLogger {

    private getCallerInfo(): string {
        const stack = new Error().stack;
        if (stack) {
            const stackLines = stack.split("\n");
            if (stackLines.length > 3) {
                const callerLine = stackLines[3];
                const callerInfo = callerLine.substring(callerLine.lastIndexOf(" ") + 1, callerLine.length).split("\\");
                const callerInfoParts = callerInfo[callerInfo.length - 1];
                return callerInfoParts.substring(0, callerInfoParts.length - 2);
            }
        }
        return "unknown";
    }

    logApi(message: string): void {
        console.log(`[API] ${new Date().toISOString()} - ${this.getCallerInfo()} : ${message}`);
    }

    logInfo(message: string): void {
        console.log(`[INFO] ${new Date().toISOString()} - ${this.getCallerInfo()} : ${message}`);
    }

    logWarn(message: string): void {
        console.warn(`[WARN] ${new Date().toISOString()} - ${this.getCallerInfo()} : ${message}`);
    }

    logError(message: string): void {
        console.error(`[ERROR] ${new Date().toISOString()} - ${this.getCallerInfo()} : ${message}`);
    }

    logDebug(message: string): void {
        console.debug(`[DEBUG] ${new Date().toISOString()} - ${this.getCallerInfo()} : ${message}`);
    }

}