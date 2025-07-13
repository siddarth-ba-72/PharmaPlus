import { DataSource, Repository } from "typeorm";
import { CartDao } from "../dao/CartDao";
import DatabaseConnectionConfig from "../config/DatabaseConnectionConfig";
import { CartSchema } from "../schema/CartSchema";
import { CartRequestModel } from "../models/CartHttpModels/CartRequestModel";
import { CartMapper } from "../mappers/CartMapper";

export class CartService implements CartDao {

    private dataSource: DataSource;
    private cartRepository: Repository<CartSchema>;
    private cartMapper: CartMapper;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.cartRepository = this.dataSource.getRepository(CartSchema);
        this.cartMapper = new CartMapper();
    }

    public async findUserCartItemsByUserCode(userCode: string): Promise<CartSchema[] | null> {
        return await this.cartRepository.find({
            where: {
                user: {
                    userCode: userCode
                }
            }
        });
    }

    public async addNewItemToUserCart(cartRequestModel: CartRequestModel, userCode: string): Promise<CartSchema> {
        const newCartItem = await this.cartMapper.toCartMedicineEntity(cartRequestModel, userCode);
        return await this.cartRepository.save(newCartItem);
    }

    public async updateUserCartItem(cartItem: CartSchema, cartRequestModel: CartRequestModel): Promise<CartSchema> {
        cartItem.quantity = cartRequestModel.quantity;
        return await this.cartRepository.save(cartItem);
    }

    public async removeUserCartItem(cartItem: CartSchema): Promise<void> {
        await this.cartRepository.remove(cartItem);
    }

    public async clearUserCartUponOrder(cartItems: CartSchema[]): Promise<void> {
        cartItems.forEach((item) => this.cartRepository.remove(item));
    }

}