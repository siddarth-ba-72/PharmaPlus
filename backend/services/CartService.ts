import { CartSchema } from "../schema/CartSchema";
import { CartRequestModel } from "../models/CartHttpModels/CartRequestModel";
import { CartMapper } from "../mappers/CartMapper";
import { CartDaoRepository } from "../repository/CartDaoRepository";
import { StockDaoRepository } from "../repository/StockDaoRepository";
import { UserDaoRepository } from "../repository/UserDaoRepository";
import { Request } from "express";
import { ResourceNotFoundException } from "../exceptions/CustomExceptions";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { CartResponseModel } from "../models/CartHttpModels/CartResponseModel";

export class CartService {

    private cartRepository: CartDaoRepository;
    private stockRepository: StockDaoRepository;
    private userRepository: UserDaoRepository;
    private cartMapper: CartMapper;

    constructor() {
        this.cartRepository = new CartDaoRepository();
        this.stockRepository = new StockDaoRepository();
        this.userRepository = new UserDaoRepository();
        this.cartMapper = new CartMapper();
    }

    public async fetchUserCartItems(req: Request): Promise<CartResponseModel[]> {
        if (req.body.user) {
            const user = await this.userRepository.findUserByUserName(req.body.user.username);
            if (!user) {
                throw new ResourceNotFoundException(
                    HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                    "User not logged in"
                );
            }
            const userCartItems = await this.cartRepository.findUserCartItemsByUserCode(user.userCode) || [];
            return await this.cartMapper.mapToCartResponse(userCartItems);
        } else {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "User not logged in"
            );
        }
    }

    public async manageUserCart(req: Request): Promise<CartResponseModel[]> {
        if (req.body.user) {
            const user = await this.userRepository.findUserByUserName(req.body.user.username);
            if (!user) {
                throw new ResourceNotFoundException(
                    HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                    "User not logged in"
                );
            }
            const cartRequests = req.body as CartRequestModel[];
            let userCartItems: CartSchema[] = await this.cartRepository.findUserCartItemsByUserCode(user.userCode) || [];
            const medicineStocks = [];
            for (const cartReq of cartRequests) {
                medicineStocks.push(await this.stockRepository.findMedicineStockByMedicineCode(cartReq.medicineCode));
            }
            if (userCartItems.length > 0) {
                for (const cartItem of userCartItems) {
                    const cartReq = cartRequests.find(req => req.medicineCode === cartItem.medicine.medicineCode);
                    if (!cartReq) {
                        await this.cartRepository.removeUserCartItem(cartItem);
                    }
                }
                userCartItems = await this.cartRepository.findUserCartItemsByUserCode(user.userCode) || [];
            }
            if (cartRequests.length > 0) {
                for (const cartReq of cartRequests) {
                    const stock = medicineStocks.find(med => med?.medicine.medicineCode === cartReq.medicineCode);
                    if (!stock || cartReq.quantity > stock.quantity) {
                        continue;
                    } else {
                        const cartItem = userCartItems.find(item => item.medicine.medicineCode === cartReq.medicineCode);
                        if (cartItem) {
                        } else {
                            const newCartItem = await this.cartRepository.addNewItemToUserCart(cartReq, user.userCode);
                        }
                    }
                }
            }
            userCartItems = await this.cartRepository.findUserCartItemsByUserCode(user.userCode) || [];
            return await this.cartMapper.mapToCartResponse(userCartItems);
        } else {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "User not logged in"
            );
        }
    }

}