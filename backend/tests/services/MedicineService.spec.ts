import { MedicineService } from "../../services/MedicineService";
import { BadRequestException, ResourceNotFoundException } from "../../exceptions/CustomExceptions";
import { HttpResponseStatusCodesConstants } from "../../utils/HttpResponseStatusCodesConstants";

describe("MedicineService", () => {
  const medicineRequest = {
    medicineName: "Paracetamol",
    medicineCode: "MED100",
    composition: "Acetaminophen",
    categoryCode: "CAT1"
  };

  const medicineSchema = {
    medicineCode: "MED100",
    medicineName: "Paracetamol",
    composition: "Acetaminophen",
    category: { categoryCode: "CAT1", categoryName: "Pain Relief" }
  };

  const medicineResponse = {
    medicineCode: "MED100",
    medicineName: "Paracetamol",
    composition: "Acetaminophen",
    category: "Pain Relief"
  };

  it("throws BadRequestException when medicine already exists", async () => {
    const service = new MedicineService();
    const medicineRepository = {
      findMedicineByMedicineName: jest.fn().mockResolvedValue(medicineSchema)
    };

    (service as any).medicineRepository = medicineRepository;

    await expect(service.addMedicineDetails(medicineRequest as any)).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.addMedicineDetails(medicineRequest as any)).rejects.toMatchObject({
      statusCode: HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE
    });
  });

  it("deletes medicine stock and medicine record when both exist", async () => {
    const service = new MedicineService();
    const medicineRepository = {
      findMedicineByMedicineCode: jest.fn().mockResolvedValue(medicineSchema),
      deleteMedicineRecord: jest.fn().mockResolvedValue(undefined)
    };
    const stockRepository = {
      findMedicineStockByMedicineCode: jest.fn().mockResolvedValue({ stockId: 1 }),
      deleteMedicineStock: jest.fn().mockResolvedValue(undefined)
    };

    (service as any).medicineRepository = medicineRepository;
    (service as any).stockRepository = stockRepository;

    await service.deleteMedicineRecord("MED100");

    expect(stockRepository.findMedicineStockByMedicineCode).toHaveBeenCalledWith("MED100");
    expect(stockRepository.deleteMedicineStock).toHaveBeenCalledTimes(1);
    expect(medicineRepository.deleteMedicineRecord).toHaveBeenCalledWith(medicineSchema);
  });

  it("throws ResourceNotFoundException when medicine does not exist", async () => {
    const service = new MedicineService();
    const medicineRepository = {
      findMedicineByMedicineCode: jest.fn().mockResolvedValue(null)
    };

    (service as any).medicineRepository = medicineRepository;

    await expect(service.deleteMedicineRecord("MISSING")).rejects.toBeInstanceOf(ResourceNotFoundException);
  });

  it("returns mapped medicines from fetchAllMedicines", async () => {
    const service = new MedicineService();
    const medicineRepository = {
      findAllMedicines: jest.fn().mockResolvedValue([medicineSchema])
    };
    const medicineMapper = {
      mapToMedicineResponseArray: jest.fn().mockResolvedValue([medicineResponse])
    };

    (service as any).medicineRepository = medicineRepository;
    (service as any).medicineMapper = medicineMapper;

    const result = await service.fetchAllMedicines();

    expect(medicineRepository.findAllMedicines).toHaveBeenCalledTimes(1);
    expect(medicineMapper.mapToMedicineResponseArray).toHaveBeenCalledWith([medicineSchema]);
    expect(result).toEqual([medicineResponse]);
  });
});
