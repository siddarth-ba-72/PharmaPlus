import { Request, Response } from "express";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { MedicineMapper } from "../mappers/MedicineMapper";
import { MedicineRequestModel } from "../models/MedicineHttpModels/MedicineRequestModel";
import { MedicineResponseModel } from "../models/MedicineHttpModels/MedicineResponseModel";
import { MedicineUpdateRequestModel } from "../models/MedicineHttpModels/MedicineUpdateRequestModel";
import { MedicineService } from "../services/MedicineService";
import { StockService } from "../services/StockService";

export class MedicineController {

    private medicineService: MedicineService;
    private stockService: StockService;
    private medicineMapper: MedicineMapper;
    private logger: ApplicationLogger;

    constructor() {
        this.medicineService = new MedicineService();
        this.stockService = new StockService();
        this.medicineMapper = new MedicineMapper();
        this.logger = new ApplicationLogger();
    }

    /*
    * GET/ all-medicines/
    * Non Authenticated Access
    */
    public getAllMedicines = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineService) {
                const medicines = await this.medicineService.findAllMedicines();
                if (medicines.length === 0) {
                    this.logger.logInfo("No medicines found");
                    res.status(HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS)
                        .json({ medicines });
                } else {
                    this.logger.logInfo(`Found ${medicines.length} medicines`);
                    const medicinesResponse = await this.medicineMapper.mapToMedicineResponseArray(medicines);
                    res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
                        .json({ medicines: medicinesResponse });
                }
            } else {
                this.logger.logError("Medicine service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine service not autowired properly" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

    /*
    * POST/ save-medicine/
    * Admin Access
    */
    public addMedicine = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineService) {
                const medicineRequest: MedicineRequestModel = req.body as MedicineRequestModel;
                const existingMedicine = await this.medicineService.findMedicineByMedicineName(medicineRequest.medicineName);
                if (existingMedicine) {
                    this.logger.logError("Medicine already exists");
                    res.status(HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE).json({
                        message: "Medicine already exists",
                    });
                    return;
                }
                const savedMedicine = await this.medicineService.addMedicine(medicineRequest);
                const medicineResponse: MedicineResponseModel = await this.medicineMapper.mapToMedicineResponse(savedMedicine);
                this.logger.logInfo(`Medicine ${savedMedicine.medicineName} saved successfully`);
                res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                    .json({ medicine: medicineResponse });
            } else {
                this.logger.logError("Medicine service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine service not autowired properly" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

    /*
    * PUT/ update-medicine/
    * Admin Access
    */
    public updateMedicine = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineService) {
                const medicineCode = req.query.medicineCode as string;
                const medicine = await this.medicineService.findMedicineByMedicineCode(medicineCode);
                if (!medicine) {
                    this.logger.logError("Medicine not found");
                    res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                        .json({ message: "Medicine not found" });
                    return;
                }
                const medicineUpdateReq: MedicineUpdateRequestModel = req.body as MedicineUpdateRequestModel;
                await this.medicineService.updateMedicineDetails(medicine, medicineUpdateReq);
                const medicineResponse: MedicineResponseModel = await this.medicineMapper.mapToMedicineResponse(medicine);
                res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                    .json({ medicine: medicineResponse });
            } else {
                this.logger.logError("Medicine service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine service not autowired properly" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

    /*
    * PUT/ delete-medicine/
    * Admin Access
    */
    public deleteMedicine = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineService && this.stockService) {
                const medicineCode = req.query.medicineCode as string;
                const medicine = await this.medicineService.findMedicineByMedicineCode(medicineCode);
                if (!medicine) {
                    this.logger.logError("Medicine not found");
                    res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                        .json({ message: "Medicine not found" });
                    return;
                }
                const medicineStock = await this.stockService.findMedicineStockByMedicineCode(medicineCode);
                if (medicineStock) {
                    await this.stockService.deleteMedicineStock(medicineStock);
                    this.logger.logDebug(`Medicine stock for ${medicine.medicineName} deleted succesfully`);
                }
                await this.medicineService.deleteMedicineRecord(medicine);
                this.logger.logDebug(`Medicine ${medicine.medicineName} deleted successfully`);
                res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
                    .json({ message: `Medicine record for ${medicine.medicineName} deleted successfully!` });
            } else {
                this.logger.logError("Medicine service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine service not autowired properly" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

}