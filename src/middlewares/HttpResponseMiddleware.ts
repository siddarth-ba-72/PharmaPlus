import { Response } from 'express';
import { HttpResponseStatusCodesConstants } from '../utils/HttpResponseStatusCodesConstants';

class HttpResponseMiddleware {

    public async getRetrievedSuccessResponse(response: Response, httpData: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
            .json({
                success: true,
                data: httpData
            });
    }

    public async getCreatedSuccessResponse(response: Response, httpData: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
            .json({
                success: true,
                data: httpData
            });
    }

    public async getNoContentSuccessResponse(response: Response, httpData: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS)
            .json({
                success: true,
                data: httpData
            });
    }

    public async getBadRequestFailureResponse(response: Response, errorMessage: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE)
            .json({
                success: false,
                error: errorMessage
            });
    }

    public async getUnauthorizedFailureResponse(response: Response, errorMessage: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.UNAUTHORIZED_FAILURE)
            .json({
                success: false,
                error: errorMessage
            });
    }

    public async getForbiddenFailureResponse(response: Response, errorMessage: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.FORBIDDEN_FAILURE)
            .json({
                success: false,
                error: errorMessage
            });
    }

    public async getNotFoundFailureResponse(response: Response, errorMessage: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
            .json({
                success: false,
                error: errorMessage
            });
    }

    public async getNotAllowedFailureResponse(response: Response, errorMessage: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE)
            .json({
                success: false,
                error: errorMessage
            });
    }

    public async getServerErrorFailureResponse(response: Response, errorMessage: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
            .json({
                success: false,
                error: errorMessage
            });
    }

    public async getBadGatewayFailureResponse(response: Response, errorMessage: any): Promise<Response> {
        return response.status(HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE)
            .json({
                success: false,
                error: errorMessage
            });
    }

}

export default HttpResponseMiddleware;