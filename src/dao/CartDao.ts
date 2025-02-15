import { CartRequestModel } from "../models/CartHttpModels/CartRequestModel";
import { CartSchema } from "../schema/CartSchema";

export interface CartDao {

    findUserCartItemsByUserCode(userCode: string): Promise<CartSchema[] | null>;

    addNewItemToUserCart(cartRequestModel: CartRequestModel, userCode: string): Promise<CartSchema>;

    updateUserCartItem(cartItem: CartSchema, cartRequestModel: CartRequestModel): Promise<CartSchema>;

    removeUserCartItem(cartItem: CartSchema): Promise<void>;

}