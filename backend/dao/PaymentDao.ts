import { OrderRequestModel } from "../models/OrderHttpModels/OrderRequestModel";

export interface PaymentDao {

    makePayment(orderReq: OrderRequestModel, userCode: string): Promise<string>;

}