import { StockMapper } from "../mappers/StockMapper";
import { ApplicationLogger } from "../utils/ApplicationLogger";
import { Request, Response } from "express";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { StockRequestModel } from "../models/StockHttpModels/StockRequestModel";
import { StockResponseModel } from "../models/StockHttpModels/StockResponseModel";
import { MedicineService } from "../services/MedicineService";
import { StockService } from "../services/StockService";

export class StockController {

    private stockService: StockService;
    private medicineService: MedicineService;
    private stockMapper: StockMapper;
    private logger: ApplicationLogger;

    constructor() {
        this.stockService = new StockService();
        this.medicineService = new MedicineService();
        this.stockMapper = new StockMapper();
        this.logger = new ApplicationLogger();
    }

    /*
    * POST/ modify-stock/
    * Admin Access
    */
    public modifyStock = async (req: Request, res: Response): Promise<void> => {
        try {
            if (this.medicineService && this.stockService) {
                const stockReq = req.body as StockRequestModel;
                const isMedicine = await this.medicineService.findMedicineByMedicineCode(stockReq.medicineCode);
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
                const medStock = await this.stockService.findMedicineStockByMedicineCode(stockReq.medicineCode);
                if (!medStock) {
                    const savedStock = await this.stockService.saveMedicineStock(stockReq);
                    const stockResponse = await this.stockMapper.toStockResponse(savedStock);
                    res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                        .json({ medicine: stockResponse });
                } else {
                    const savedStock = await this.stockService.updateMedicineStock(medStock, stockReq);
                    const stockResponse = await this.stockMapper.toStockResponse(savedStock);
                    res.status(HttpResponseStatusCodesConstants.CREATED_SUCCESS)
                        .json({ medicine: stockResponse });
                }
            } else {
                this.logger.logError("Stock service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Stock service not autowired properly" });
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
            if (this.stockService) {
                const medicineStocks = await this.stockService.findAllMedicineStocks();
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
                this.logger.logError("Stock service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Stock service not autowired properly" });
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
            if (this.stockService) {
                const { medicineCode } = req.params;
                const medicine = await this.medicineService.findMedicineByMedicineCode(medicineCode);
                if (!medicine) {
                    this.logger.logError("Medicine not found");
                    res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                        .json({ message: "Medicine not found" });
                    return;
                }
                const medicineStock = await this.stockService.findMedicineStockByMedicineCode(medicineCode);
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
                this.logger.logError("Stock service not autowired properly");
                res.status(HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE)
                    .json({ message: "Stock service not autowired properly" });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            res.status(HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE)
                .json({ message: error.message });
        }
    }

}