import { Request, Response } from "express";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { MedicineMapper } from "../mappers/MedicineMapper";
import { MedicineRequestModel } from "../models/MedicineHttpModels/MedicineRequestModel";
import { MedicineResponseModel } from "../models/MedicineHttpModels/MedicineResponseModel";
import { MedicineUpdateRequestModel } from "../models/MedicineHttpModels/MedicineUpdateRequestModel";
import { MedicineService } from "../services/MedicineService";
import { StockService } from "../services/StockService";
import { HttpResponseMiddleware } from "../middlewares/HttpResponseMiddleware";

export class MedicineController {

    private medicineService: MedicineService;
    private stockService: StockService;
    private medicineMapper: MedicineMapper;
    private logger: ApplicationLogger;
    private httpResponse: HttpResponseMiddleware;

    constructor() {
        this.medicineService = new MedicineService();
        this.stockService = new StockService();
        this.medicineMapper = new MedicineMapper();
        this.logger = new ApplicationLogger();
        this.httpResponse = new HttpResponseMiddleware();
    }

    /*
    * GET/ all-medicines/
    * Non Authenticated Access
    */
    public getAllMedicines = async (req: Request, res: Response): Promise<void> => {
        try {
            const medicines = await this.medicineService.findAllMedicines();
            if (medicines.length === 0) {
                this.logger.logInfo("No medicines found");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                    message: "No medicines found",
                    medicines: null
                });
            } else {
                this.logger.logInfo(`Found ${medicines.length} medicines`);
                const medicinesResponse = await this.medicineMapper.mapToMedicineResponseArray(medicines);
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                    medicines: medicinesResponse
                });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

    /*
    * POST/ save-medicine/
    * Admin Access
    */
    public addMedicine = async (req: Request, res: Response): Promise<void> => {
        try {
            const medicineRequest: MedicineRequestModel = req.body as MedicineRequestModel;
            const existingMedicine = await this.medicineService.findMedicineByMedicineName(medicineRequest.medicineName);
            if (existingMedicine) {
                this.logger.logError("Medicine already exists");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE, {
                    message: "Medicine already exists",
                });
            }
            const savedMedicine = await this.medicineService.addMedicine(medicineRequest);
            const medicineResponse: MedicineResponseModel = await this.medicineMapper.mapToMedicineResponse(savedMedicine);
            this.logger.logInfo(`Medicine ${savedMedicine.medicineName} saved successfully`);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, { medicine: medicineResponse });
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

    /*
    * PUT/ update-medicine/
    * Admin Access
    */
    public updateMedicine = async (req: Request, res: Response): Promise<void> => {
        try {
            const medicineCode = req.query.medicineCode as string;
            const medicine = await this.medicineService.findMedicineByMedicineCode(medicineCode);
            if (!medicine) {
                this.logger.logError("Medicine not found");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, { message: "Medicine not found" });
            }
            const medicineUpdateReq: MedicineUpdateRequestModel = req.body as MedicineUpdateRequestModel;
            await this.medicineService.updateMedicineDetails(medicine, medicineUpdateReq);
            const medicineResponse: MedicineResponseModel = await this.medicineMapper.mapToMedicineResponse(medicine);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, { medicine: medicineResponse });
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

    /*
    * PUT/ delete-medicine/
    * Admin Access
    */
    public deleteMedicine = async (req: Request, res: Response): Promise<void> => {
        try {
            const medicineCode = req.query.medicineCode as string;
            const medicine = await this.medicineService.findMedicineByMedicineCode(medicineCode);
            if (!medicine) {
                this.logger.logError("Medicine not found");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, { message: "Medicine not found" });
            }
            const medicineStock = await this.stockService.findMedicineStockByMedicineCode(medicineCode);
            if (medicineStock) {
                await this.stockService.deleteMedicineStock(medicineStock);
                this.logger.logDebug(`Medicine stock for ${medicine.medicineName} deleted succesfully`);
            }
            await this.medicineService.deleteMedicineRecord(medicine);
            this.logger.logDebug(`Medicine ${medicine.medicineName} deleted successfully`);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, { message: `Medicine record for ${medicine.medicineName} deleted successfully!` });
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

}