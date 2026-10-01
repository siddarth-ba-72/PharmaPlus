import { PaymentDaoRepository } from "../../repository/PaymentDaoRepository";

describe("PaymentDaoRepository", () => {
  it("creates a missing payment type before saving a payment", async () => {
    const repository = new PaymentDaoRepository();

    const paymentTypeRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn((data) => data),
      save: jest.fn().mockResolvedValue({ paymentTypeCode: "COD", paymentMethod: "Cash on Delivery" })
    };

    const paymentRepository = {
      save: jest.fn().mockImplementation(async (payment) => payment)
    };

    const paymentMapper = {
      toPaymentEntity: jest.fn().mockImplementation(async (orderReq, userCode) => ({
        paymentCode: "TXN123",
        user: { userCode },
        paymentType: { paymentTypeCode: orderReq.paymentTypeCode },
        paymentPrice: orderReq.paymentPrice,
      }))
    };

    (repository as any).paymentTypeRepository = paymentTypeRepository;
    (repository as any).paymentRepository = paymentRepository;
    (repository as any).paymentMapper = paymentMapper;

    const orderReq = { paymentPrice: 250, paymentTypeCode: "cod" } as any;

    const result = await repository.makePayment(orderReq, "PBT22");

    expect(paymentTypeRepository.findOne).toHaveBeenCalledWith({ where: { paymentTypeCode: "COD" } });
    expect(paymentTypeRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ paymentTypeCode: "COD", paymentMethod: "Cash on Delivery" })
    );
    expect(paymentMapper.toPaymentEntity).toHaveBeenCalledWith({ ...orderReq, paymentTypeCode: "COD" }, "PBT22");
    expect(paymentRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ paymentType: expect.objectContaining({ paymentTypeCode: "COD" }) })
    );
    expect(result).toBe("TXN123");
  });
});
