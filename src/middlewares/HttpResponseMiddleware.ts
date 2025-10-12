import { Response } from 'express';
import { HttpResponseStatusCodesConstants } from '../utils/HttpResponseStatusCodesConstants';

export class HttpResponseMiddleware {

    /**
     * Returns a standardized HTTP response based on the status code and data provided.
     * @param response - The Express response object.
     * @param statusCode - The HTTP status code to return.
     * @param httpData - The data to include in the response body.
     */

    public async sendHttpResponse(response: Response, statusCode: number, httpData: any): Promise<void> {
        switch (statusCode) {
            case HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS:
            case HttpResponseStatusCodesConstants.CREATED_SUCCESS:
            case HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS:
                this.getHttpResponsebody(response, true, statusCode, httpData);
                break;
            case HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE:
            case HttpResponseStatusCodesConstants.UNAUTHORIZED_FAILURE:
            case HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE:
            case HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE:
            case HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE:
            case HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE:
            case HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE:
                this.getHttpResponsebody(response, false, statusCode, httpData);
                break;
            default:
                this.getHttpResponsebody(response, true, statusCode, httpData);
                break;
        }
    }

    private async getHttpResponsebody(
        response: Response,
        success: boolean,
        statusCode: number,
        msg: any
    ): Promise<void> {
        if (success) {
            response.status(statusCode).json({
                success,
                data: msg
            });
        } else {
            response.status(statusCode).json({
                success,
                error: msg
            });
        }
    }

}