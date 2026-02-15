import { HttpResponseMiddleware } from "../middlewares/HttpResponseMiddleware";
import { ApplicationLogger } from "../utils/ApplicationLogger";

export abstract class AbstractController {

    protected httpResponse: HttpResponseMiddleware;
    protected logger: ApplicationLogger;

    constructor() {
        this.httpResponse = new HttpResponseMiddleware();
        this.logger = new ApplicationLogger();
    }

    protected async sendHttpResponse(res: any, statusCode: number, data: any): Promise<void> {
        return await this.httpResponse.sendHttpResponse(res, statusCode, data);
    }

    protected logApi(message: string): void {
        this.logger.logApi(message);
    }

    protected logInfo(message: string): void {
        this.logger.logInfo(message);
    }

    protected logError(message: string): void {
        this.logger.logError(message);
    }

    protected logDebug(message: string): void {
        this.logger.logDebug(message);
    }

    protected logWarn(message: string): void {
        this.logger.logWarn(message);
    }

}
