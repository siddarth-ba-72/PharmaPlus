import { CartSchema } from "../schema/CartSchema";
import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";

export interface OrderDao {

    addNewOrderMedicineItems(userCartItem: CartSchema[], userCode: string, orderMedicineCode: string, transactionCode: string): Promise<OrderMedicineSchema[]>;

    findOrderByOrderMedicineCode(orderMedicineCode: string): Promise<OrderSchema | null>;

    findOrdersByUserCode(userCode: string): Promise<OrderSchema[] | null>;

}