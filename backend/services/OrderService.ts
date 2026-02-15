import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";
import { CartSchema } from "../schema/CartSchema";
import { OrderMapper } from "../mappers/OrderMapper";
import { UserDaoRepository } from "../repository/UserDaoRepository";
import { StockDaoRepository } from "../repository/StockDaoRepository";
import { CartDaoRepository } from "../repository/CartDaoRepository";
import { OrderDaoRepository } from "../repository/OrderDaoRepository";
import { OrderResponseModel } from "../models/OrderHttpModels/OrderResponseModel";
import { Request } from "express";
import { v4 as uuidv4 } from "uuid";
import { BadRequestException, ResourceNotFoundException } from "../exceptions/CustomExceptions";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { UserOrderResponseModel } from "../models/OrderHttpModels/UserOrderResponseModel";
import { MedicineStockSchema } from "../schema/MedicineStockSchema";
import { OrderRequestModel } from "../models/OrderHttpModels/OrderRequestModel";
import { PaymentDaoRepository } from "../repository/PaymentDaoRepository";

export class OrderService {

    private orderRepository: OrderDaoRepository;
    private userRepository: UserDaoRepository;
    private cartRepository: CartDaoRepository;
    private stockRepository: StockDaoRepository;
    private paymentRepository: PaymentDaoRepository;
    private orderMapper: OrderMapper;

    constructor() {
        this.orderRepository = new OrderDaoRepository();
        this.userRepository = new UserDaoRepository();
        this.cartRepository = new CartDaoRepository();
        this.stockRepository = new StockDaoRepository();
        this.paymentRepository = new PaymentDaoRepository();
        this.orderMapper = new OrderMapper();
    }

    public async fetchUserOrders(req: Request): Promise<UserOrderResponseModel[] | null> {
        if (req.body.user) {
            const user = await this.userRepository.findUserByUserName(req.body.user.username);
            if (!user) {
                throw new ResourceNotFoundException(
                    HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                    "User not logged in"
                );
            }
            const userOrders: OrderSchema[] | null = await this.orderRepository.findOrdersByUserCode(user?.userCode);
            return await Promise.all(
                userOrders?.map(async (userOrder): Promise<UserOrderResponseModel> => {
                    const orderMedicines: OrderMedicineSchema[] | null = await this.orderRepository.findOrderMedicineByOrder(userOrder?.orderMedicineCode);
                    return this.orderMapper.mapToUserOrderResponseModel(userOrder, orderMedicines);
                }) ?? []
            );
        } else {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "User not logged in"
            );
        }
    }

    public async orderUserItems(req: Request): Promise<OrderResponseModel> {
        if (req.body.user) {
            const user = await this.userRepository.findUserByUserName(req.body.user.username);
            if (!user) {
                throw new ResourceNotFoundException(
                    HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                    "User not logged in"
                );
            }
            const userCartItems: CartSchema[] = await this.cartRepository.findUserCartItemsByUserCode(user.userCode) || [];
            let totalActualPrice = 0;
            for (const item of userCartItems) {
                const itemStock: MedicineStockSchema | null = await this.stockRepository.findMedicineStockByMedicineCode(item.medicine.medicineCode);
                if (!itemStock) {
                    throw new BadRequestException(
                        HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                        `Stock not found for medicine code: ${item.medicine.medicineCode}`
                    );
                }
                totalActualPrice += itemStock.price;
            }
            const orderReq = req.body as OrderRequestModel;
            orderReq.paymentPrice = totalActualPrice;
            const orderMedicineCode = uuidv4().replace(/-/g, "").substring(0, 10).toUpperCase();

            const transactionCode: string = await this.paymentRepository.makePayment(orderReq, user.userCode);
            if (!transactionCode) {
                throw new BadRequestException(
                    HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                    "Could not process the payment"
                );
            }
            const newOrderItems: OrderMedicineSchema[] = await this.orderRepository.addNewOrderMedicineItems(userCartItems, user.userCode, orderMedicineCode, transactionCode);
            const newOrder: OrderSchema | null = await this.orderRepository.findOrderByOrderMedicineCode(orderMedicineCode);
            if (!newOrder) {
                throw new BadRequestException(
                    HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                    "Cannot place order"
                );
            }
            await this.stockRepository.updateMedicineStockUponOrder(newOrderItems);
            await this.cartRepository.clearUserCartUponOrder(userCartItems);
            return await this.orderMapper.mapToOrderResponseModel(user, orderMedicineCode, transactionCode, newOrderItems);
        } else {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "User not logged in"
            );
        }
    }

}