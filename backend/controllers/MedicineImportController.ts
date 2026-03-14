import { Request, Response } from "express";
import { AsyncRequestHandler } from "../middlewares/AsyncRequestHandler";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import { AbstractController } from "./AbstractController";
import { MedicineImportService } from "../services/MedicineImportService";
import {
    CreatePreviewJobRequestModel,
    CreateUploadSessionRequestModel
} from "../models/MedicineImportHttpModels/MedicineImportModels";

export class MedicineImportController extends AbstractController {

    private medicineImportService: MedicineImportService;

    constructor() {
        super();
        this.medicineImportService = new MedicineImportService();
    }

    public createUploadSession = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const payload = req.body as CreateUploadSessionRequestModel;
        const uploadSession = await this.medicineImportService.createUploadSession(payload);
        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.CREATED_SUCCESS,
            uploadSession
        );
    });

    public completeUpload = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const { uploadId } = req.params;
        const file = (req as any).file as Express.Multer.File | undefined;
        const completionDetails = await this.medicineImportService.completeUpload(uploadId, file);
        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS,
            completionDetails
        );
    });

    public createPreviewJob = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const payload = req.body as CreatePreviewJobRequestModel;
        const createdByUserId = req.body?.user?.userId || req.body?.user?.id;
        const jobSummary = await this.medicineImportService.createPreviewJob(payload, createdByUserId);
        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.CREATED_SUCCESS,
            jobSummary
        );
    });

    public getJobSummary = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const { jobId } = req.params;
        const jobSummary = await this.medicineImportService.getJobSummary(jobId);
        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS,
            jobSummary
        );
    });

    public getJobRows = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const { jobId } = req.params;
        const { page, pageSize, validationStatus, executionStatus } = req.query;
        const rows = await this.medicineImportService.getJobRows(
            jobId,
            Number(page || 1),
            Number(pageSize || 50),
            validationStatus as string | undefined,
            executionStatus as string | undefined
        );
        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS,
            rows
        );
    });

    public updateJobRow = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const { jobId, rowNumber } = req.params;
        const rowDetails = await this.medicineImportService.updateJobRow(
            jobId,
            Number(rowNumber),
            req.body?.overrides || {}
        );

        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS,
            rowDetails
        );
    });

    public approveAndStartExecution = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const { jobId } = req.params;
        const result = await this.medicineImportService.approveAndStartExecution(jobId);
        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS,
            result
        );
    });

    public cancelExecution = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const { jobId } = req.params;
        const result = await this.medicineImportService.cancelJobExecution(jobId);
        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS,
            result
        );
    });

    public retryFailedRows = AsyncRequestHandler.handleRequest(async (req: Request, res: Response): Promise<void> => {
        const { jobId } = req.params;
        const retryFilter = req.body?.retryFilter || "FAILED_RETRYABLE";
        const result = await this.medicineImportService.retryFailedRows(jobId, retryFilter);
        return this.httpResponse.sendHttpResponse(
            res,
            HttpResponseStatusCodesConstants.RETRIEVED_SUCCESS,
            result
        );
    });

}
