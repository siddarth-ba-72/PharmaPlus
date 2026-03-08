import { v4 as uuidv4 } from "uuid";
import { CartRequestModel } from "../models/CartHttpModels/CartRequestModel";
import { CartSchema } from "../schema/CartSchema";
import { CartResponseModel } from "../models/CartHttpModels/CartResponseModel";

export class CartMapper {

    public async toCartMedicineEntity(cartMedicineReq: CartRequestModel, userCode: string): Promise<CartSchema> {
        const cart = new CartSchema();
        cart.user = { userCode: userCode } as any;
        cart.cartCode = uuidv4().replace(/-/g, "").substring(0, 10).toUpperCase();
        cart.medicine = { medicineCode: cartMedicineReq.medicineCode } as any;
        cart.quantity = cartMedicineReq.quantity;
        return cart;
    }

    public async mapToCartResponse(cartItems: CartSchema[]): Promise<CartResponseModel[]> {
        const cartResponse: CartResponseModel[] = [];
        for (const item of cartItems) {
            const cartRes = new CartResponseModel();
            cartRes.medicineCode = item.medicine ? item.medicine.medicineCode : "";
            cartRes.medicine = item.medicine ? item.medicine.medicineName : "";
            cartRes.quantity = item.quantity;
            cartResponse.push(cartRes);
        }
        return cartResponse;
    }

}
