import { Request, Response } from "express";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { MedicineRequestModel } from "../models/MedicineHttpModels/MedicineRequestModel";
import { MedicineUpdateRequestModel } from "../models/MedicineHttpModels/MedicineUpdateRequestModel";
import { MedicineService } from "../services/MedicineService";
import { AbstractController } from "./AbstractController";

export class MedicineController extends AbstractController {

    private medicineService: MedicineService;

    constructor() {
        super();
        this.medicineService = new MedicineService();
    }

    /*
    * GET/ all-medicines/
    * Non Authenticated Access
    */
    public getAllMedicines = async (req: Request, res: Response): Promise<void> => {
        try {
            const medicines = await this.medicineService.fetchAllMedicines();
            if (medicines.length === 0) {
                this.logger.logInfo("No medicines found");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                    message: "No medicines found",
                    medicines: null
                });
            } else {
                this.logger.logInfo(`Found ${medicines.length} medicines`);
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                    medicines
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
            const savedMedicine = await this.medicineService.addMedicineDetails(medicineRequest);
            this.logger.logInfo(`Medicine ${savedMedicine.medicineName} saved successfully`);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
                savedMedicine
            });
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
            const medicineUpdateReq: MedicineUpdateRequestModel = req.body as MedicineUpdateRequestModel;
            const medicine = await this.medicineService.updateMedicineDetails(medicineCode, medicineUpdateReq);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
                medicine
            });
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
            await this.medicineService.deleteMedicineRecord(medicineCode);
            this.logger.logDebug(`Medicine ${medicineCode} deleted successfully`);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                message: `Medicine record for ${medicineCode} deleted successfully!`
            });
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: "Something went wrong!",
            });
        }
    }

}