import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { CartService } from "../services/CartService";
import { OrderService } from "../services/OrderService";
import { PaymentService } from "../services/PaymentService";
import { UserService } from "../services/UserService";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { UserSchema } from "../schema/UserSchema";
import { CartSchema } from "../schema/CartSchema";
import { OrderRequestModel } from "../models/OrderHttpModels/OrderRequestModel";
import { StockService } from "../services/StockService";
import { MedicineStockSchema } from "../schema/MedicineStockSchema";
import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";
import { OrderMapper } from "../mappers/OrderMapper";
import { OrderResponseModel } from "../models/OrderHttpModels/OrderResponseModel";
import { HttpResponseMiddleware } from "../middlewares/HttpResponseMiddleware";

export class OrderController {

    private orderService: OrderService;
    private userService: UserService;
    private cartService: CartService;
    private stockService: StockService;
    private paymentService: PaymentService;
    private orderMapper: OrderMapper;
    private logger: ApplicationLogger;
    private httpResponse: HttpResponseMiddleware;

    constructor() {
        this.orderService = new OrderService();
        this.userService = new UserService();
        this.cartService = new CartService();
        this.stockService = new StockService();
        this.paymentService = new PaymentService();
        this.orderMapper = new OrderMapper();
        this.logger = new ApplicationLogger();
        this.httpResponse = new HttpResponseMiddleware();
    }

    /*
    * POST/ new-order/
    * Authenticated Access
    */
    public orderItems = async (req: Request, res: Response): Promise<void> => {
        try {
            if (req.body.user) {
                const user: UserSchema = await this.userService.findLoggedInUser(req);
                if (!user) {
                    return this.httpResponse.sendHttpResponse(
                        res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
                        message: "User not found"
                    });
                }
                const userCartItems: CartSchema[] = await this.cartService.findUserCartItemsByUserCode(user.userCode) || [];
                if (userCartItems.length <= 0) {
                    return this.httpResponse.sendHttpResponse(
                        res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                        message: "User cart is empty"
                    });
                }
                let totalActualPrice = 0;
                for (const item of userCartItems) {
                    const itemStock: MedicineStockSchema | null = await this.stockService.findMedicineStockByMedicineCode(item.medicine.medicineCode);
                    if (!itemStock) {
                        this.logger.logError(`Stock not found for medicine code: ${item.medicine.medicineCode}`)
                        return this.httpResponse.sendHttpResponse(
                            res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
                            message: `Stock not found for medicine code: ${item.medicine.medicineCode}`
                        });
                    }
                    totalActualPrice += itemStock.price;
                }
                const orderReq = req.body as OrderRequestModel;
                orderReq.paymentPrice = totalActualPrice;
                const orderMedicineCode = uuidv4().replace(/-/g, "").substring(0, 10).toUpperCase();

                const transactionCode: string = await this.paymentService.makePayment(orderReq, user.userCode);
                if (!transactionCode) {
                    return this.httpResponse.sendHttpResponse(
                        res, HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, {
                        message: "Could not process the payment"
                    });
                }
                const newOrderItems: OrderMedicineSchema[] = await this.orderService.addNewOrderMedicineItems(userCartItems, user.userCode, orderMedicineCode, transactionCode);
                const newOrder: OrderSchema | null = await this.orderService.findOrderByOrderMedicineCode(orderMedicineCode);
                if (!newOrder) {
                    this.logger.logError(`Could not place order`)
                    return this.httpResponse.sendHttpResponse(
                        res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
                        message: `Cannot place order`
                    });
                }
                await this.stockService.updateMedicineStockUponOrder(newOrderItems);
                await this.cartService.clearUserCartUponOrder(userCartItems);
                const orderResponse: OrderResponseModel = await this.orderMapper.mapToOrderResponseModel(user, orderMedicineCode, transactionCode, newOrderItems);
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
                    message: `Order placed successfully for user: ${user.username}`,
                    order: orderResponse
                });
            } else {
                this.logger.logError("User not found");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.UNAUTHORIZED_FAILURE, {
                    message: "User not found"
                });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

    /*
    * GET/ my-orders/
    * Authenticated Access
    */
    public userOrders = async (req: Request, res: Response): Promise<void> => {
        try {
            if (req.body.user) {
                const user: UserSchema = await this.userService.findLoggedInUser(req);
                if (!user) {
                    return this.httpResponse.sendHttpResponse(
                        res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
                        message: "User not found"
                    });
                }
                const userOrders: OrderSchema[] | null = await this.orderService.findOrdersByUserCode(user?.userCode);
                if (userOrders == null || userOrders.length === 0) {
                    this.logger.logError(`No orders for user: ${user?.username}`);
                    return this.httpResponse.sendHttpResponse(
                        res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                        message: `No orders for user: ${user?.username}`,
                        orders: null
                    });
                }
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                    message: `Found ${userOrders.length} orders for user: ${user?.username}`,
                    orders: userOrders
                });
            } else {
                this.logger.logError("User not found");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.UNAUTHORIZED_FAILURE, {
                    message: "User not found"
                });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

}