import { StockService } from "../../services/StockService";
import { BadRequestException, ResourceNotFoundException } from "../../exceptions/CustomExceptions";
import { HttpResponseStatusCodesConstants } from "../../utils/HttpResponseStatusCodesConstants";

describe("StockService", () => {
  const stockRequest = {
    medicineCode: "MED100",
    price: 125,
    quantity: 10
  };

  const medicineSchema = {
    medicineCode: "MED100",
    medicineName: "Paracetamol"
  };

  const stockSchema = {
    stockId: 1,
    medicine: medicineSchema,
    price: 125,
    quantity: 10,
    mfgDate: new Date("2025-01-01"),
    expDate: new Date("2027-01-01")
  };

  const stockResponse = {
    medicineCode: "MED100",
    medicineName: "Paracetamol",
    category: null,
    categoryCode: null,
    price: 125,
    quantity: 10,
    mfgDate: new Date("2025-01-01"),
    expDate: new Date("2027-01-01")
  };

  it("throws ResourceNotFoundException when medicine does not exist in fetchMedicineWithStock", async () => {
    const service = new StockService();
    const medicineRepository = {
      findMedicineByMedicineCode: jest.fn().mockResolvedValue(null)
    };

    (service as any).medicineRepository = medicineRepository;

    await expect(service.fetchMedicineWithStock("MISSING")).rejects.toBeInstanceOf(ResourceNotFoundException);
    await expect(service.fetchMedicineWithStock("MISSING")).rejects.toMatchObject({
      statusCode: HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE
    });
  });

  it("throws BadRequestException when stock price or quantity is not positive", async () => {
    const service = new StockService();
    const medicineRepository = {
      findMedicineByMedicineCode: jest.fn().mockResolvedValue(medicineSchema)
    };

    (service as any).medicineRepository = medicineRepository;

    await expect(
      service.modifyMedicineStock({ ...stockRequest, price: 0 } as any)
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.modifyMedicineStock({ ...stockRequest, quantity: 0 } as any)
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("creates stock when medicine has no existing stock", async () => {
    const service = new StockService();
    const medicineRepository = {
      findMedicineByMedicineCode: jest.fn().mockResolvedValue(medicineSchema)
    };
    const stockRepository = {
      findMedicineStockByMedicineCode: jest.fn().mockResolvedValue(null),
      saveMedicineStock: jest.fn().mockResolvedValue(stockSchema),
      updateMedicineStock: jest.fn()
    };
    const stockMapper = {
      toStockResponse: jest.fn().mockResolvedValue(stockResponse)
    };

    (service as any).medicineRepository = medicineRepository;
    (service as any).stockRepository = stockRepository;
    (service as any).stockMapper = stockMapper;

    const result = await service.modifyMedicineStock(stockRequest as any);

    expect(stockRepository.saveMedicineStock).toHaveBeenCalledWith(stockRequest);
    expect(stockRepository.updateMedicineStock).not.toHaveBeenCalled();
    expect(stockMapper.toStockResponse).toHaveBeenCalledWith(stockSchema);
    expect(result).toEqual(stockResponse);
  });

  it("updates stock when medicine already has stock", async () => {
    const service = new StockService();
    const medicineRepository = {
      findMedicineByMedicineCode: jest.fn().mockResolvedValue(medicineSchema)
    };
    const stockRepository = {
      findMedicineStockByMedicineCode: jest.fn().mockResolvedValue(stockSchema),
      saveMedicineStock: jest.fn(),
      updateMedicineStock: jest.fn().mockResolvedValue({ ...stockSchema, quantity: 15 })
    };
    const stockMapper = {
      toStockResponse: jest.fn().mockResolvedValue({ ...stockResponse, quantity: 15 })
    };

    (service as any).medicineRepository = medicineRepository;
    (service as any).stockRepository = stockRepository;
    (service as any).stockMapper = stockMapper;

    const result = await service.modifyMedicineStock({ ...stockRequest, quantity: 15 } as any);

    expect(stockRepository.updateMedicineStock).toHaveBeenCalledWith(stockSchema, { ...stockRequest, quantity: 15 });
    expect(stockRepository.saveMedicineStock).not.toHaveBeenCalled();
    expect(result.quantity).toBe(15);
  });
});
