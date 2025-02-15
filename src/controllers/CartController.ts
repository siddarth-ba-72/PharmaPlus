import { ApplicationLogger } from "../utils/ApplicationLogger";
import { CartDao } from "../dao/CartDao";
import { Request, Response } from "express";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { UserSchema } from "../schema/UserSchema";
import { CartMapper } from "../mappers/CartMapper";
import { CartRequestModel } from "../models/CartHttpModels/CartRequestModel";
import { CartResponseModel } from "../models/CartHttpModels/CartResponseModel";

export class CartController extends CartDao {

    private logger: ApplicationLogger;
    private cartMapper: CartMapper;

    constructor() {
        super();
        this.logger = new ApplicationLogger();
        this.cartMapper = new CartMapper();
    }

    /*
    * POST/ modify-cart/
    * Authenticated Access
    */
    public modifyUserCart = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.cartDao && this.stockDao) {
                if (req.body.user) {
                    const user = req.body.user as UserSchema;
                    if (!user) {
                        this.logger.logError("User not logged in");
                        res.status(HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE)
                            .json({ error: "Bad Gateway Authentication" })
                    }
                    const cartRequests = req.body as CartRequestModel[];
                    let userCartItems = await this.cartDao.find({
                        where: {
                            user: {
                                userCode: user.userCode
                            }
                        }
                    });
                    const medicineStocks = [];
                    for (const cartReq of cartRequests) {
                        medicineStocks.push(await this.stockDao.findOne({
                            where: {
                                medicine: {
                                    medicineCode: cartReq.medicineCode
                                }
                            }
                        }));
                    }
                    if (userCartItems.length > 0) {
                        for (const cartItem of userCartItems) {
                            const cartReq = cartRequests.find(req => req.medicineCode === cartItem.medicine.medicineCode);
                            if (!cartReq) {
                                await this.cartDao.remove(cartItem);
                            }
                        }
                        userCartItems = await this.cartDao.find({
                            where: {
                                user: {
                                    userCode: user.userCode
                                }
                            }
                        });
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
                                    cartItem.quantity = cartReq.quantity;
                                    await this.cartDao.save(cartItem);
                                    this.logger.logInfo(`Updated the qty of ${cartItem.medicine.medicineName} in the cart`);
                                } else {
                                    const newCartItem = await this.cartMapper.toCartMedicineEntity(cartReq, user.userCode);
                                    await this.cartDao.save(newCartItem);
                                    this.logger.logInfo(`Added ${newCartItem.medicine.medicineName} to the cart`);
                                }
                            }
                        }
                    }
                    userCartItems = await this.cartDao.find({
                        where: {
                            user: {
                                userCode: user.userCode
                            }
                        }
                    });
                    const userCartResponse = await this.cartMapper.mapToCartResponse(userCartItems);
                    res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                        .json(userCartResponse);
                }
            } else {
                this.logger.logError("Cart repository not found");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Cart repository not found" });
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
            if (this.cartDao) {
                if (req.body.user) {
                    const user = req.body.user as UserSchema;
                    if (!user) {
                        this.logger.logError("User not logged in");
                        res.status(HttpResponseStatusCodesConstants.BAD_GATEWAY_FAILURE)
                            .json({ error: "Bad Gateway Authentication" })
                    }
                    const userCartItems = await this.cartDao.find({
                        where: {
                            user: {
                                userCode: user.userCode
                            }
                        }
                    });
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
                this.logger.logError("Cart repository not found");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Cart repository not found" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

}