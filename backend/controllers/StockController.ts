import { Request, Response } from "express";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { StockRequestModel } from "../models/StockHttpModels/StockRequestModel";
import { StockService } from "../services/StockService";
import { AbstractController } from "./AbstractController";

export class StockController extends AbstractController {

    private stockService: StockService;

    constructor() {
        super();
        this.stockService = new StockService();
    }

    /*
    * GET/ all-medicines-stock/
    * Non Authenticated Access
    */
    public getAllMedicinesWithStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const medicineStocks = await this.stockService.fetchAllMedicinesWithStock();
            if (medicineStocks.length === 0) {
                this.logger.logInfo("Stocks are empty for all the medicines");
                this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                    message: "Stocks are empty for all the medicines"
                });
            } else {
                this.logger.logInfo(`Found ${medicineStocks.length} medicines with active stocks`);
                this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                    medicineStocks
                });
            }
        } catch (error: any) {
            this.logger.logError(error.message);
            this.httpResponse.sendHttpResponse(
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
            const medicineStock = await this.stockService.fetchMedicineWithStock(medicineCode);
            if (medicineStock === null) {
                this.logger.logError("No stocks for this medicine")
                return this.httpResponse.sendHttpResponse(
                    res, HttpResponseStatusCodesConstants.NO_CONTENT_SUCCESS, {
                    message: `There are no stocks for ${medicineCode}`
                });
            }
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS, {
                medicineStock
            });
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: error.message
            });
        }
    }

    /*
    * POST/ modify-stock/
    * Admin Access
    */
    public modifyStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const stockReq = req.body as StockRequestModel;
            const stockResponse = await this.stockService.modifyMedicineStock(stockReq);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.CREATED_SUCCESS, {
                message: `Stock for ${stockReq.medicineCode} updated successfully`,
                stockResponse
            });
        } catch (error: any) {
            this.logger.logError(error.message);
            return this.httpResponse.sendHttpResponse(
                res, HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE, {
                message: error.message
            });
        }
    }

}