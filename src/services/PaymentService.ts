import { DataSource, Repository } from "typeorm";
import { PaymentDao } from "../dao/PaymentDao";
import DatabaseConnection from "../middlewares/DatabaseConnection";
import { PaymentSchema } from "../schema/PaymentSchema";
import { OrderRequestModel } from "../models/OrderHttpModels/OrderRequestModel";
import { PaymentMapper } from "../mappers/PaymentMapper";

export class PaymentService implements PaymentDao {

    private dataSource: DataSource;
    private paymentRepository: Repository<PaymentSchema>;
    private paymentMapper: PaymentMapper;

    constructor() {
        this.dataSource = DatabaseConnection.getInstance().getDataSource();
        this.paymentRepository = this.dataSource.getRepository(PaymentSchema);
        this.paymentMapper = new PaymentMapper();
    }

    public async makePayment(orderReq: OrderRequestModel, userCode: string): Promise<string> {
        const payment: PaymentSchema = await this.paymentMapper.toPaymentEntity(orderReq, userCode);
        await this.paymentRepository.save(payment);
        return payment.paymentCode;
    }

}