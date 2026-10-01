import { DataSource, Repository } from "typeorm";
import { PaymentDao } from "../dao/PaymentDao";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { PaymentSchema } from "../schema/PaymentSchema";
import { PaymentTypeSchema } from "../schema/PaymentTypesSchema";
import { OrderRequestModel } from "../models/OrderHttpModels/OrderRequestModel";
import { PaymentMapper } from "../mappers/PaymentMapper";

export class PaymentDaoRepository implements PaymentDao {

    private dataSource: DataSource;
    private paymentRepository: Repository<PaymentSchema>;
    private paymentTypeRepository: Repository<PaymentTypeSchema>;
    private paymentMapper: PaymentMapper;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.paymentRepository = this.dataSource.getRepository(PaymentSchema);
        this.paymentTypeRepository = this.dataSource.getRepository(PaymentTypeSchema);
        this.paymentMapper = new PaymentMapper();
    }

    private normalizePaymentTypeCode(paymentTypeCode: string): string {
        const normalized = (paymentTypeCode ?? "").trim().toUpperCase();
        switch (normalized) {
            case "UPI":
            case "CARD":
            case "COD":
                return normalized;
            default:
                return normalized || "COD";
        }
    }

    private resolvePaymentMethodLabel(paymentTypeCode: string): string {
        switch (paymentTypeCode) {
            case "UPI":
                return "UPI";
            case "CARD":
                return "Card";
            case "COD":
                return "Cash on Delivery";
            default:
                return paymentTypeCode;
        }
    }

    public async makePayment(orderReq: OrderRequestModel, userCode: string): Promise<string> {
        const paymentTypeCode = this.normalizePaymentTypeCode(orderReq.paymentTypeCode);
        const paymentType = await this.paymentTypeRepository.findOne({
            where: {
                paymentTypeCode: paymentTypeCode
            }
        });

        if (!paymentType) {
            const newPaymentType = this.paymentTypeRepository.create({
                paymentTypeCode: paymentTypeCode,
                paymentMethod: this.resolvePaymentMethodLabel(paymentTypeCode)
            });
            await this.paymentTypeRepository.save(newPaymentType);
        }

        const normalizedOrderReq = { ...orderReq, paymentTypeCode: paymentTypeCode };
        const payment: PaymentSchema = await this.paymentMapper.toPaymentEntity(normalizedOrderReq, userCode);
        await this.paymentRepository.save(payment);
        return payment.paymentCode;
    }

}