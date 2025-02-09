import { Request, Response } from "express";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { MedicineDao } from "../dao/MedicineDao";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { MedicineMapper } from "../mappers/MedicineMapper";
import { MedicineRequestModel } from "../models/MedicineHttpModels/MedicineRequestModel";
import { MedicineSchema } from "../schema/MedicineSchema";
import { MedicineResponseModel } from "../models/MedicineHttpModels/MedicineResponseModel";
import { MedicineUpdateRequestModel } from "../models/MedicineHttpModels/MedicineUpdateRequestModel";

export class MedicineController extends MedicineDao {

    private logger: ApplicationLogger;
    private medicineMapper: MedicineMapper;

    constructor() {
        super();
        this.logger = new ApplicationLogger();
        this.medicineMapper = new MedicineMapper();
    }

    /*
    * GET/ all-medicines/
    * Non Authenticated Access
    */
    public getAllMedicines = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineDao && this.medicineCategoryDao) {
                const medicines = await this.medicineDao.find();
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
                this.logger.logError("Medicine repository not found");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine repository not found" });
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
            if (this.medicineDao) {
                const medicineRequest: MedicineRequestModel = req.body as MedicineRequestModel;
                const existingMedicine = await this.medicineDao.findOne({
                    where: { medicineName: medicineRequest.medicineName }
                });
                if (existingMedicine) {
                    this.logger.logError("Medicine already exists");
                    res.status(HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE).json({
                        message: "Medicine already exists",
                    });
                    return;
                }
                const medicine: MedicineSchema = await this.medicineMapper.toMedicineEntity(medicineRequest);
                const savedMedicine = await this.medicineDao.save(medicine);
                const medicineResponse: MedicineResponseModel = await this.medicineMapper.mapToMedicineResponse(savedMedicine);
                this.logger.logInfo(`Medicine ${savedMedicine.medicineName} saved successfully`);
                res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                    .json({ medicine: medicineResponse });
            } else {
                this.logger.logError("Medicine repository not found");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine repository not found" });
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
            if (this.medicineDao) {
                const medicineCode = req.query.medicineCode as string;
                const medicine = await this.medicineDao.findOne({
                    where: {
                        medicineCode: medicineCode
                    }
                });
                if (!medicine) {
                    this.logger.logError("Medicine not found");
                    res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                        .json({ message: "Medicine not found" });
                    return;
                }
                const medicineUpdateReq: MedicineUpdateRequestModel = req.body as MedicineUpdateRequestModel;
                medicine.medicineName = medicineUpdateReq.medicineName;
                medicine.composition = medicineUpdateReq.composition;
                medicine.category = { categoryCode: medicineUpdateReq.categoryCode } as any;
                await this.medicineDao.save(medicine);
                const medicineResponse: MedicineResponseModel = await this.medicineMapper.mapToMedicineResponse(medicine);
                res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                    .json({ medicine: medicineResponse });
            } else {
                this.logger.logError("Medicine repository not found");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine repository not found" });
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
            if (this.medicineDao && this.medicineStockDao) {
                const medicineCode = req.query.medicineCode as string;
                const medicine = await this.medicineDao.findOne({
                    where: {
                        medicineCode: medicineCode
                    }
                });
                if (!medicine) {
                    this.logger.logError("Medicine not found");
                    res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                        .json({ message: "Medicine not found" });
                    return;
                }
                const medicineStock = await this.medicineStockDao.findOne({
                    where: {
                        medicine: {
                            medicineCode: medicineCode
                        }
                    }
                });
                if (medicineStock) {
                    await this.medicineStockDao.remove(medicineStock);
                    this.logger.logDebug(`Medicine stock for ${medicine.medicineName} deleted succesfully`);
                }
                await this.medicineDao.remove(medicine);
                this.logger.logDebug(`Medicine ${medicine.medicineName} deleted successfully`);
                res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
                    .json({ message: `Medicine record for ${medicine.medicineName} deleted successfully!` });
            } else {
                this.logger.logError("Medicine repository not found");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine repository not found" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

}