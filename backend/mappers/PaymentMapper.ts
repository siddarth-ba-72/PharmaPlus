import { v4 as uuidv4 } from "uuid";
import { PaymentSchema } from "../schema/PaymentSchema";
import { OrderRequestModel } from "../models/OrderHttpModels/OrderRequestModel";

export class PaymentMapper {

    public async toPaymentEntity(orderReq: OrderRequestModel, userCode: string): Promise<PaymentSchema> {
        const payment: PaymentSchema = new PaymentSchema();
        payment.paymentCode = uuidv4().replace(/-/g, "").substring(0, 10).toUpperCase();
        payment.user = { userCode: userCode } as any;
        payment.paymentType = { paymentTypeCode: orderReq.paymentTypeCode } as any;
        payment.paymentPrice = orderReq.paymentPrice;
        return payment;
    }

}