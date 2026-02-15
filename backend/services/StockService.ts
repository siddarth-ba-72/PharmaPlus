import { StockRequestModel } from "../models/StockHttpModels/StockRequestModel";
import { StockMapper } from "../mappers/StockMapper";
import { StockDaoRepository } from "../repository/StockDaoRepository";
import { StockResponseModel } from "../models/StockHttpModels/StockResponseModel";
import { BadRequestException, ResourceNotFoundException } from "../exceptions/CustomExceptions";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { MedicineDaoRepository } from "../repository/MedicineDaoRepository";

export class StockService {

    private stockRepository: StockDaoRepository;
    private medicineRepository: MedicineDaoRepository;
    private stockMapper: StockMapper;

    constructor() {
        this.stockRepository = new StockDaoRepository();
        this.medicineRepository = new MedicineDaoRepository();
        this.stockMapper = new StockMapper();
    }

    public async fetchAllMedicinesWithStock(): Promise<StockResponseModel[]> {
        const medicineStocks = await this.stockRepository.findAllMedicineStocks();
        return await this.stockMapper.mapToStockResponseArray(medicineStocks);
    }

    public async fetchMedicineWithStock(medicineCode: string): Promise<StockResponseModel | null> {
        const medicine = await this.medicineRepository.findMedicineByMedicineCode(medicineCode);
        if (!medicine) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                `Medicine with code ${medicineCode} not found`
            );
        }
        const medicineStock = await this.stockRepository.findMedicineStockByMedicineCode(medicineCode);
        return medicineStock ? await this.stockMapper.toStockResponse(medicineStock) : null;
    }

    public async modifyMedicineStock(stockReq: StockRequestModel): Promise<StockResponseModel> {
        const isMedicine = await this.medicineRepository.findMedicineByMedicineCode(stockReq.medicineCode);
        if (!isMedicine) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                `Medicine with code ${stockReq.medicineCode} not found. Please select the correct medicine`
            );
        }
        if (stockReq.price <= 0 || stockReq.quantity <= 0) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.NOT_ALLOWED_FAILURE,
                "Price and Qty should be greater than 0"
            );
        }
        const medStock = await this.stockRepository.findMedicineStockByMedicineCode(stockReq.medicineCode);
        let stockResponse: StockResponseModel;
        if (!medStock) {
            const savedStock = await this.stockRepository.saveMedicineStock(stockReq);
            stockResponse = await this.stockMapper.toStockResponse(savedStock);
        } else {
            const savedStock = await this.stockRepository.updateMedicineStock(medStock, stockReq);
            stockResponse = await this.stockMapper.toStockResponse(savedStock);
        }
        return stockResponse;
    }

}