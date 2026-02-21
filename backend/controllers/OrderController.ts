import { Request, Response } from "express";
import { OrderService } from "../services/OrderService";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { OrderResponseModel } from "../models/OrderHttpModels/OrderResponseModel";
import { AbstractController } from "./AbstractController";
import { AsyncRequestHandler } from "../middlewares/AsyncRequestHandler";

export class OrderController extends AbstractController {

    private orderService: OrderService;

    constructor() {
        super();
        this.orderService = new OrderService();
    }

    /*
    * GET/ my-orders/
    * Authenticated Access
    */
    public userOrders = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const userOrders = await this.orderService.fetchUserOrders(req);
        if (userOrders == null || userOrders.length === 0) {
            this.logger.logError(`No orders for user: ${req.body.user?.username}`);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                message: `No orders for user: ${req.body.user?.username}`,
                orders: null
            });
        }
        return this.httpResponse.sendHttpResponse(
            res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
            message: `Found ${userOrders.length} orders for user: ${req.body.user?.username}`,
            userOrders
        });
    });

    /*
    * POST/ new-order/
    * Authenticated Access
    */
    public orderItems = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const orderResponse: OrderResponseModel = await this.orderService.orderUserItems(req);
        return this.httpResponse.sendHttpResponse(
            res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
            message: `Order placed successfully for user: ${req.body.user?.username}`,
            order: orderResponse
        });
    });

}