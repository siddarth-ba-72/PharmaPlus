import { CartSchema } from "../schema/CartSchema";
import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";

export interface FrequentlyOrderedMedicine {
    medicineCode: string;
    totalQuantity: number;
}

export interface OrderDao {

    addNewOrderMedicineItems(userCartItem: CartSchema[], userCode: string, orderMedicineCode: string, transactionCode: string, orderedMedicinePrices: Record<string, number>): Promise<OrderMedicineSchema[]>;

    findOrderByOrderMedicineCode(orderMedicineCode: string): Promise<OrderSchema | null>;

    findOrdersByUserCode(userCode: string): Promise<OrderSchema[] | null>;

    findOrderMedicineByOrder(orderMedicineCode: string): Promise<OrderMedicineSchema[] | null>;

    findFrequentlyOrderedMedicinesByUserCode(userCode: string, limit: number): Promise<FrequentlyOrderedMedicine[]>;

}