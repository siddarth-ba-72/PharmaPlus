import { CartSchema } from "../schema/CartSchema";
import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";
import { OrderMedicineResponseModel, OrderResponseModel } from "../models/OrderHttpModels/OrderResponseModel";
import { UserSchema } from "../schema/UserSchema";

export class OrderMapper {

    public async toOrderMedicinesEntityArray(userCartItem: CartSchema[], orderMedicineCode: string): Promise<OrderMedicineSchema[]> {
        const orderMedicines: OrderMedicineSchema[] = [];
        userCartItem.forEach((item: CartSchema) => {
            const orderMedicine: OrderMedicineSchema = new OrderMedicineSchema();
            orderMedicine.order = { orderMedicineCode: orderMedicineCode } as any;
            orderMedicine.medicine = { medicineCode: item.medicine.medicineCode } as any;
            orderMedicine.quantity = item.quantity;
            orderMedicines.push(orderMedicine);
        })
        return orderMedicines;
    }

    public async toOrderEntity(orderMedicineCode: string, userCode: string, transactionCode: string): Promise<OrderSchema> {
        const order: OrderSchema = new OrderSchema();
        order.payment = { paymentCode: transactionCode } as any;
        order.user = { userCode: userCode } as any;
        order.orderMedicineCode = orderMedicineCode;
        return order;
    }

    public async mapToOrderResponseModel(user: UserSchema, orderCode: string, transactionCode: string, orderItems: OrderMedicineSchema[]): Promise<OrderResponseModel> {
        const orderResponse: OrderResponseModel = new OrderResponseModel();
        orderResponse.user = `${user.firstName} ${user.lastName}`;
        orderResponse.orderNumber = orderCode;
        orderResponse.transaction = transactionCode;
        const orderMedicinesResponse: OrderMedicineResponseModel[] = [];
        orderItems.forEach((item: OrderMedicineSchema) => {
            const orderMedResponse: OrderMedicineResponseModel = new OrderMedicineResponseModel();
            orderMedResponse.medicineName = item.medicine?.medicineName;
            orderMedResponse.category = item.medicine?.category?.categoryName;
            orderMedResponse.quantity = item.quantity;
            orderMedicinesResponse.push(orderMedResponse);
        });
        orderResponse.medicines = orderMedicinesResponse;
        return orderResponse;
    }

}