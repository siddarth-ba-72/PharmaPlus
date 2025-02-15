import { Request, Response } from "express";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { CartMapper } from "../mappers/CartMapper";
import { CartRequestModel } from "../models/CartHttpModels/CartRequestModel";
import { CartResponseModel } from "../models/CartHttpModels/CartResponseModel";
import { CartService } from "../services/CartService";
import { StockService } from "../services/StockService";
import { UserService } from "../services/UserService";
import { CartSchema } from "../schema/CartSchema";

export class CartController {

    private cartService: CartService;
    private stockService: StockService;
    private userService: UserService;
    private cartMapper: CartMapper;
    private logger: ApplicationLogger;

    constructor() {
        this.cartService = new CartService();
        this.stockService = new StockService();
        this.userService = new UserService();
        this.logger = new ApplicationLogger();
        this.cartMapper = new CartMapper();
    }

    /*
    * POST/ modify-cart/
    * Authenticated Access
    */
    public modifyUserCart = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.cartService && this.stockService) {
                if (req.body.user) {
                    const user = await this.userService.findLoggedInUser(req);
                    if (!user) {
                        this.logger.logError("User not logged in");
                        res.status(HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE)
                            .json({ error: "Bad Gateway Authentication" })
                    }
                    const cartRequests = req.body as CartRequestModel[];
                    let userCartItems: CartSchema[] = await this.cartService.findUserCartItemsByUserCode(user.userCode) || [];
                    const medicineStocks = [];
                    for (const cartReq of cartRequests) {
                        medicineStocks.push(await this.stockService.findMedicineStockByMedicineCode(cartReq.medicineCode));
                    }
                    if (userCartItems.length > 0) {
                        for (const cartItem of userCartItems) {
                            const cartReq = cartRequests.find(req => req.medicineCode === cartItem.medicine.medicineCode);
                            if (!cartReq) {
                                await this.cartService.removeUserCartItem(cartItem);
                            }
                        }
                        userCartItems = await this.cartService.findUserCartItemsByUserCode(user.userCode) || [];
                    }
                    if (cartRequests.length > 0) {
                        for (const cartReq of cartRequests) {
                            const stock = medicineStocks.find(med => med?.medicine.medicineCode === cartReq.medicineCode);
                            if (!stock) {
                                this.logger.logWarn(`No Stocks found for ${cartReq.medicineCode}`);
                                continue;
                            } else if (cartReq.quantity > stock.quantity) {
                                this.logger.logWarn(`Not enough Stocks found for ${cartReq.medicineCode}`);
                                continue;
                            } else {
                                const cartItem = userCartItems.find(item => item.medicine.medicineCode === cartReq.medicineCode);
                                if (cartItem) {
                                    await this.cartService.updateUserCartItem(cartItem, cartReq);
                                    this.logger.logInfo(`Updated the qty of ${cartItem.medicine.medicineName} in the cart`);
                                } else {
                                    const newCartItem = await this.cartService.addNewItemToUserCart(cartReq, user.userCode);
                                    this.logger.logInfo(`Added ${newCartItem.medicine.medicineName} to the cart`);
                                }
                            }
                        }
                    }
                    userCartItems = await this.cartService.findUserCartItemsByUserCode(user.userCode) || [];
                    const userCartResponse = await this.cartMapper.mapToCartResponse(userCartItems);
                    res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                        .json(userCartResponse);
                }
            } else {
                this.logger.logError("Cart service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Cart service not autowired properly" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

    /*
    * GET/ user-cart/
    * Authenticated Access
    */
    public getUserCart = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.cartService) {
                if (req.body.user) {
                    const user = await this.userService.findLoggedInUser(req);
                    if (!user) {
                        this.logger.logError("User not logged in");
                        res.status(HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE)
                            .json({ error: "Bad Gateway Authentication" })
                    }
                    const userCartItems = await this.cartService.findUserCartItemsByUserCode(user.userCode) || [];
                    if (userCartItems.length <= 0) {
                        this.logger.logInfo(`User is empty`);
                        res.status(HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS)
                            .json({ message: "Your cart is empty" });
                        return;
                    }
                    const cartResponse: CartResponseModel[] = await this.cartMapper.mapToCartResponse(userCartItems);
                    res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
                        .json(cartResponse);
                } else {
                    this.logger.logError("User not found");
                    res.status(HttpResponseStatusCodesConstants.UNAUTHORIZED_FAILURE)
                        .json({ message: "User not found" });
                }
            } else {
                this.logger.logError("Cart service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Cart service not autowired properly" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

}