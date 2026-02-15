import { MedicineMapper } from "../mappers/MedicineMapper";
import { MedicineRequestModel } from "../models/MedicineHttpModels/MedicineRequestModel";
import { MedicineUpdateRequestModel } from "../models/MedicineHttpModels/MedicineUpdateRequestModel";
import { MedicineDaoRepository } from "../repository/MedicineDaoRepository";
import { MedicineResponseModel } from "../models/MedicineHttpModels/MedicineResponseModel";
import { BadRequestException, ResourceNotFoundException } from "../exceptions/CustomExceptions";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { StockDaoRepository } from "../repository/StockDaoRepository";

export class MedicineService {

    private medicineRepository: MedicineDaoRepository;
    private stockRepository: StockDaoRepository;
    private medicineMapper: MedicineMapper;

    constructor() {
        this.medicineRepository = new MedicineDaoRepository();
        this.stockRepository = new StockDaoRepository();
        this.medicineMapper = new MedicineMapper();
    }

    public async fetchAllMedicines(): Promise<MedicineResponseModel[]> {
        const medicines = await this.medicineRepository.findAllMedicines();
        return await this.medicineMapper.mapToMedicineResponseArray(medicines);
    }

    public async addMedicineDetails(medicineRequest: MedicineRequestModel): Promise<MedicineResponseModel> {
        const existingMedicine = await this.medicineRepository.findMedicineByMedicineName(medicineRequest.medicineName);
        if (existingMedicine) {
            throw new BadRequestException(HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE, "Medicine with this name already exists.");
        }
        const savedMedicine = await this.medicineRepository.addMedicine(medicineRequest);
        return await this.medicineMapper.mapToMedicineResponse(savedMedicine);
    }

    public async updateMedicineDetails(medicineCode: string, medicineUpdateReq: MedicineUpdateRequestModel): Promise<MedicineResponseModel> {
        const medicine = await this.medicineRepository.findMedicineByMedicineCode(medicineCode);
        if (!medicine) {
            throw new ResourceNotFoundException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "Medicine not found.");
        }
        await this.medicineRepository.updateMedicineDetails(medicine, medicineUpdateReq);
        return await this.medicineMapper.mapToMedicineResponse(medicine);
    }

    public async deleteMedicineRecord(medicineCode: string): Promise<void> {
        const medicine = await this.medicineRepository.findMedicineByMedicineCode(medicineCode);
        if (!medicine) {
            throw new ResourceNotFoundException(HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE, "Medicine not found.");
        }
        const medicineStock = await this.stockRepository.findMedicineStockByMedicineCode(medicineCode);
        if (medicineStock) {
            await this.stockRepository.deleteMedicineStock(medicineStock);
        }
        await this.medicineRepository.deleteMedicineRecord(medicine);
    }

}