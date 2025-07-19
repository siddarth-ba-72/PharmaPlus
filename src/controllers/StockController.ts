import { StockMapper } from "../mappers/StockMapper";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { Request, Response } from "express";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { StockRequestModel } from "../models/StockHttpModels/StockRequestModel";
import { StockResponseModel } from "../models/StockHttpModels/StockResponseModel";
import { MedicineService } from "../services/MedicineService";
import { StockService } from "../services/StockService";
import { HttpResponseMiddleware } from "../middlewares/HttpResponseMiddleware";

export class StockController {

    private stockService: StockService;
    private medicineService: MedicineService;
    private stockMapper: StockMapper;
    private logger: ApplicationLogger;
    private httpResponse: HttpResponseMiddleware;

    constructor() {
        this.stockService = new StockService();
        this.medicineService = new MedicineService();
        this.stockMapper = new StockMapper();
        this.logger = new ApplicationLogger();
        this.httpResponse = new HttpResponseMiddleware();
    }

    /*
    * POST/ modify-stock/
    * Admin Access
    */
    public modifyStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const stockReq = req.body as StockRequestModel;
            const isMedicine = await this.medicineService.findMedicineByMedicineCode(stockReq.medicineCode);
            if (!isMedicine) {
                this.logger.logError("Medicine not found");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
                    message: "Please select the correct medicine",
                });
            }
            if (stockReq.price <= 0 || stockReq.quantity <= 0) {
                this.logger.logError("Price and qty cannot be less that 0");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE, {
                    message: "Price and Qty should be greater that 0"
                });
            }
            const medStock = await this.stockService.findMedicineStockByMedicineCode(stockReq.medicineCode);
            if (!medStock) {
                const savedStock = await this.stockService.saveMedicineStock(stockReq);
                const stockResponse = await this.stockMapper.toStockResponse(savedStock);
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
                    message: `Stock for ${stockReq.medicineCode} created successfully`,
                    medicine: stockResponse
                });
            } else {
                const savedStock = await this.stockService.updateMedicineStock(medStock, stockReq);
                const stockResponse = await this.stockMapper.toStockResponse(savedStock);
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
                    medicine: stockResponse
                });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: error.message
            });
        }
    }

    /*
    * GET/ all-medicines-stock/
    * Non Authenticated Access
    */
    public getAllMedicinesWithStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const medicineStocks = await this.stockService.findAllMedicineStocks();
            if (medicineStocks.length === 0) {
                this.logger.logInfo("Stocks are empty for all the medicines");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                    message: "Stocks are empty for all the medicines"
                });
            } else {
                this.logger.logInfo(`Found ${medicineStocks.length} medicines with active stocks`);
                const stockResponse = await this.stockMapper.mapToStockResponseArray(medicineStocks);
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                    medicinesWithStocks: stockResponse
                });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: error.message
            });
        }
    }

    /*
    * GET/ medicine-stock/
    * Non Authenticated Access
    */
    public getMedicineWithStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const { medicineCode } = req.params;
            const medicine = await this.medicineService.findMedicineByMedicineCode(medicineCode);
            if (!medicine) {
                this.logger.logError("Medicine not found");
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE, {
                    message: "Medicine not found"
                });
            }
            const medicineStock = await this.stockService.findMedicineStockByMedicineCode(medicineCode);
            if (!medicineStock) {
                this.logger.logError("No stocks for this medicine")
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                    message: `There are no stocks for ${medicine.medicineName}`
                });
            }
            const medicineStockResponse: StockResponseModel | null = medicineStock ? await this.stockMapper.toStockResponse(medicineStock) : null;
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, { medicine: medicineStockResponse });
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: error.message
            });
        }
    }

}