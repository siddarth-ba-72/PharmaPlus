import { Request, Response } from "express";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { CartResponseModel } from "../models/CartHttpModels/CartResponseModel";
import { CartService } from "../services/CartService";
import { AbstractController } from "./AbstractController";
import { AsyncRequestHandler } from "../middlewares/AsyncRequestHandler";

export class CartController extends AbstractController {

    private cartService: CartService;

    constructor() {
        super();
        this.cartService = new CartService();
    }

    /*
    * GET/ user-cart/
    * Authenticated Access
    */
    public getUserCart = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const userCartItems = await this.cartService.fetchUserCartItems(req) || [];
        if (userCartItems.length <= 0) {
            this.logger.logInfo(`User is empty`);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                message: "Your cart is empty"
            });
        }
        return this.httpResponse.sendHttpResponse(
            res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
            userCartItems
        });
    });

    /*
    * POST/ modify-cart/
    * Authenticated Access
    */
    public modifyUserCart = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        let userCartItems: CartResponseModel[] = await this.cartService.manageUserCart(req) || [];
        return this.httpResponse.sendHttpResponse(
            res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
            message: `Cart updated successfully for user: ${req.body.user.username}`,
            userCartItems
        });
    });

}