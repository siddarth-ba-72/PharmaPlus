import { StockMapper } from "../mappers/StockMapper";
import { MedicineDao } from "../dao/MedicineDao";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { Request, Response } from "express";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { StockRequestModel } from "../models/StockHttpModels/StockRequestModel";
import { MedicineStockSchema } from "../schema/MedicineStockSchema";
import { StockResponseModel } from "../models/StockHttpModels/StockResponseModel";

export class StockController extends MedicineDao {

    private logger: ApplicationLogger;
    private stockMapper: StockMapper;

    constructor() {
        super();
        this.logger = new ApplicationLogger();
        this.stockMapper = new StockMapper();
    }

    /*
    * POST/ modify-stock/
    * Admin Access
    */
    public modifyStock = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineDao && this.medicineStockDao) {
                const stockReq = req.body as StockRequestModel;
                const isMedicine = await this.medicineDao.findOne({
                    where: { medicineCode: stockReq.medicineCode }
                });
                if (!isMedicine) {
                    this.logger.logError("Medicine not found");
                    res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE).json({
                        message: "Please select the correct medicine",
                    });
                    return;
                }
                if (stockReq.price <= 0 || stockReq.quantity <= 0) {
                    this.logger.logError("Price and qty cannot be less that 0");
                    res.status(HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE).json({
                        error: "Price and Qty should be greater that 0"
                    });
                }
                const medStock = await this.medicineStockDao.findOne({
                    where: {
                        medicine: {
                            medicineCode: stockReq.medicineCode
                        }
                    }
                });
                if (!medStock) {
                    const stock: MedicineStockSchema = await this.stockMapper.toStockEntity(stockReq);
                    const savedStock = await this.medicineStockDao.save(stock);
                    const stockResponse = await this.stockMapper.toStockResponse(savedStock);
                    res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                        .json({ medicine: stockResponse });
                } else {
                    medStock.price += stockReq.price;
                    medStock.quantity += stockReq.quantity;
                    const savedStock = await this.medicineStockDao.save(medStock);
                    const stockResponse = await this.stockMapper.toStockResponse(savedStock);
                    res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                        .json({ medicine: stockResponse });
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
    * GET/ all-medicines-stock/
    * Non Authenticated Access
    */
    public getAllMedicinesWithStock = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineStockDao) {
                const medicineStocks = await this.medicineStockDao.find();
                if (medicineStocks.length === 0) {
                    this.logger.logInfo("Stocks are empty for all the medicines");
                    res.status(HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS)
                        .json({ message: "Stocks are empty for all the medicines" });
                    return;
                } else {
                    this.logger.logInfo(`Found ${medicineStocks.length} medicines with active stocks`);
                    const stockResponse = await this.stockMapper.mapToStockResponseArray(medicineStocks);
                    res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
                        .json({ medicinesWithStocks: stockResponse });
                }
            } else {
                this.logger.logError("Medicine repository not found");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Medicine repository not found" });
                return;
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

    /*
    * GET/ medicine-stock/
    * Non Authenticated Access
    */
    public getMedicineWithStock = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineStockDao) {
                const { medicineCode } = req.params;
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
                if (!medicineStock) {
                    this.logger.logError("No stocks for this medicine")
                    res.status(HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS)
                        .json({ message: `There are no stocks for ${medicine.medicineName}` });
                    return;
                }
                const medicineStockResponse: StockResponseModel | null = medicineStock ? await this.stockMapper.toStockResponse(medicineStock) : null;
                res.status(HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS)
                    .json({ medicine: medicineStockResponse });
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