import ExcelJS from "exceljs";
import { v4 as uuidV4 } from "uuid";
import { Repository } from "typeorm";
import { AbstractException } from "../exceptions/AbstractException";
import { BadRequestException, ResourceNotFoundException } from "../exceptions/CustomExceptions";
import { HttpResponseStatusCodesConstants } from "../utils/HttpResponseStatusCodesConstants";
import {
    CreatePreviewJobRequestModel,
    CreateUploadSessionRequestModel,
    ImportJobSummaryModel,
    ImportRowErrorModel,
    MappedMedicinePayload,
    MappingDecisionModel
} from "../models/MedicineImportHttpModels/MedicineImportModels";
import { MedicineImportUploadRepository } from "../repository/MedicineImportUploadRepository";
import { MedicineImportJobRepository } from "../repository/MedicineImportJobRepository";
import { MedicineImportRowRepository } from "../repository/MedicineImportRowRepository";
import { MedicineImportUploadSchema } from "../schema/MedicineImportUploadSchema";
import { MedicineImportJobSchema } from "../schema/MedicineImportJobSchema";
import { MedicineImportRowSchema } from "../schema/MedicineImportRowSchema";
import { MedicineCategorySchema } from "../schema/MedicineCategorySchema";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { MedicineDaoRepository } from "../repository/MedicineDaoRepository";
import { MedicineService } from "./MedicineService";

type HeaderMap = Record<string, "medicineName" | "medicineCode" | "composition" | "categoryCode">;

export class MedicineImportService {

    private static runningJobIds: Set<string> = new Set<string>();
    private static uploadBufferStore: Map<string, { fileBuffer: Buffer; createdAt: number }> = new Map<string, { fileBuffer: Buffer; createdAt: number }>();

    private uploadRepository: MedicineImportUploadRepository;
    private jobRepository: MedicineImportJobRepository;
    private rowRepository: MedicineImportRowRepository;
    private medicineRepository: MedicineDaoRepository;
    private medicineService: MedicineService;
    private categoryRepository: Repository<MedicineCategorySchema>;
    private readonly uploadExpiryMinutes: number;
    private readonly maxUploadSizeBytes: number;

    constructor() {
        this.uploadRepository = new MedicineImportUploadRepository();
        this.jobRepository = new MedicineImportJobRepository();
        this.rowRepository = new MedicineImportRowRepository();
        this.medicineRepository = new MedicineDaoRepository();
        this.medicineService = new MedicineService();
        this.categoryRepository = DatabaseConnectionConfig
            .getInstance()
            .getDataSource()
            .getRepository(MedicineCategorySchema);
        this.uploadExpiryMinutes = 30;
        this.maxUploadSizeBytes = 10 * 1024 * 1024;
    }

    public async createUploadSession(payload: CreateUploadSessionRequestModel): Promise<Record<string, any>> {
        this.validateUploadMetadata(payload);

        const uploadSession = new MedicineImportUploadSchema();
        uploadSession.uploadId = uuidV4();
        uploadSession.fileName = payload.fileName;
        uploadSession.mimeType = payload.mimeType;
        uploadSession.sizeBytes = payload.sizeBytes;
        uploadSession.checksumSha256 = payload.checksumSha256 || null;
        uploadSession.storagePath = null;
        uploadSession.sheetNames = null;
        uploadSession.headerRowCandidates = null;
        uploadSession.status = "CREATED";
        uploadSession.expiresAt = new Date(Date.now() + this.uploadExpiryMinutes * 60 * 1000);

        const savedUpload = await this.uploadRepository.createUploadSession(uploadSession);
        return {
            uploadId: savedUpload.uploadId,
            uploadUrl: `/pp/webapp/api/admin/medicine-imports/uploads/${savedUpload.uploadId}/complete`,
            expiresAt: savedUpload.expiresAt,
            maxSizeBytes: this.maxUploadSizeBytes
        };
    }

    public async completeUpload(uploadId: string, file: Express.Multer.File | undefined): Promise<Record<string, any>> {
        const uploadSession = await this.uploadRepository.findByUploadId(uploadId);
        if (!uploadSession) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                "Upload session not found"
            );
        }

        if (uploadSession.expiresAt.getTime() < Date.now()) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Upload session expired. Please create a new upload session."
            );
        }

        if (!file || !file.buffer) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Missing file. Please upload an Excel file in 'file' form field."
            );
        }

        this.validateUploadedFile(file.mimetype, file.size);

        this.cleanupExpiredUploadBuffers();
        MedicineImportService.uploadBufferStore.set(uploadId, {
            fileBuffer: file.buffer,
            createdAt: Date.now()
        });

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(file.buffer as any);

        if (workbook.worksheets.length === 0) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Uploaded workbook has no sheets."
            );
        }

        const defaultWorksheet = workbook.worksheets[0];
        const headerCandidates = this.detectHeaderRowCandidates(defaultWorksheet);

        uploadSession.storagePath = null;
        uploadSession.sheetNames = workbook.worksheets.map((sheet) => sheet.name);
        uploadSession.headerRowCandidates = headerCandidates;
        uploadSession.status = "UPLOADED";
        await this.uploadRepository.updateUploadSession(uploadSession);

        return {
            uploadId: uploadSession.uploadId,
            sheets: uploadSession.sheetNames,
            detectedHeaderRowCandidates: headerCandidates
        };
    }

    public async createPreviewJob(payload: CreatePreviewJobRequestModel, createdByUserId?: string): Promise<Record<string, any>> {
        if (!payload.uploadId) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "uploadId is required"
            );
        }

        const uploadSession = await this.uploadRepository.findByUploadId(payload.uploadId);
        const inMemoryUpload = MedicineImportService.uploadBufferStore.get(payload.uploadId);
        if (!uploadSession || uploadSession.status !== "UPLOADED" || !inMemoryUpload) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Upload is not completed. Please complete file upload first."
            );
        }

        const workbook = new ExcelJS.Workbook();
        let fileBuffer: Buffer;
        if (inMemoryUpload?.fileBuffer) {
            fileBuffer = inMemoryUpload.fileBuffer;
        } else if (uploadSession.storagePath) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Legacy disk-based uploads are disabled. Please re-upload the file."
            );
        } else {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Upload buffer not found. Please upload the file again."
            );
        }

        await workbook.xlsx.load(fileBuffer as any);

        const worksheet = payload.sheetName
            ? workbook.getWorksheet(payload.sheetName)
            : workbook.worksheets[0];

        if (!worksheet) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Specified sheet not found in uploaded workbook"
            );
        }

        const headerRowIndex = payload.headerRowIndex || uploadSession.headerRowCandidates?.[0] || 1;
        const headers = this.extractHeaders(worksheet, headerRowIndex);
        const { headerMap, mappingDecisions } = this.buildHeaderMap(headers);

        const categoryCodes = await this.fetchCategoryCodeSet();
        const existingMedicines = await this.medicineRepository.findAllMedicines();
        const existingMedicineCodeSet = new Set(existingMedicines.map((medicine) => medicine.medicineCode.toLowerCase()));
        const existingMedicineNameSet = new Set(existingMedicines.map((medicine) => medicine.medicineName.toLowerCase()));

        const job = new MedicineImportJobSchema();
        job.jobId = uuidV4();
        job.uploadId = uploadSession.uploadId;
        job.createdByUserId = createdByUserId || null;
        job.mode = payload.mode || "CREATE_ONLY";
        job.dryRun = payload.dryRun ?? true;
        job.state = "VALIDATING";
        job.sheetName = worksheet.name;
        job.headerRowIndex = headerRowIndex;
        job.totalRows = 0;
        job.validRows = 0;
        job.warningRows = 0;
        job.invalidRows = 0;
        job.summaryJson = null;
        job.cancelRequested = false;
        job.approvedAt = null;
        job.startedAt = null;
        job.finishedAt = null;
        await this.jobRepository.createJob(job);

        const seenMedicineCodes = new Set<string>();
        const rowsToSave: MedicineImportRowSchema[] = [];
        let totalRows = 0;
        let validRows = 0;
        let invalidRows = 0;

        for (let rowNumber = headerRowIndex + 1; rowNumber <= worksheet.rowCount; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const originalPayload = this.buildOriginalPayload(headers, row.values as ExcelJS.CellValue[]);
            if (this.isRowEmpty(Object.values(originalPayload))) {
                continue;
            }

            totalRows += 1;
            const mappedPayload = this.mapRowToMedicinePayload(row.values as ExcelJS.CellValue[], headerMap);
            const errors = this.validateMappedPayload(
                mappedPayload,
                categoryCodes,
                existingMedicineCodeSet,
                existingMedicineNameSet,
                seenMedicineCodes,
                job.mode
            );

            if (mappedPayload.medicineCode) {
                seenMedicineCodes.add(mappedPayload.medicineCode.toLowerCase());
            }

            const rowEntity = new MedicineImportRowSchema();
            rowEntity.jobId = job.jobId;
            rowEntity.rowNumber = rowNumber;
            rowEntity.originalPayloadJson = originalPayload;
            rowEntity.mappedPayloadJson = mappedPayload;
            rowEntity.validationStatus = errors.length === 0 ? "VALID" : "INVALID";
            rowEntity.executionStatus = "PENDING";
            rowEntity.errorCodesJson = errors.length > 0 ? errors : null;
            rowEntity.errorMessage = errors.length > 0 ? errors.map((error) => error.message).join(" | ") : null;
            rowEntity.retriesAttempted = 0;
            rowEntity.medicineCode = mappedPayload.medicineCode || null;
            rowEntity.medicineId = null;
            rowEntity.idempotencyKey = `${job.jobId}:${rowNumber}:${mappedPayload.medicineCode || "UNKNOWN"}`;
            rowsToSave.push(rowEntity);

            if (errors.length === 0) {
                validRows += 1;
            } else {
                invalidRows += 1;
            }
        }

        if (rowsToSave.length > 0) {
            await this.rowRepository.saveRows(rowsToSave);
        }

        const summary: ImportJobSummaryModel = {
            totalRows,
            validRows,
            warningRows: 0,
            invalidRows,
            mapping: mappingDecisions
        };

        job.totalRows = totalRows;
        job.validRows = validRows;
        job.warningRows = 0;
        job.invalidRows = invalidRows;
        job.summaryJson = summary;
        job.state = "REVIEW_REQUIRED";
        await this.jobRepository.updateJob(job);

        // Upload file is no longer needed after row-level preview is persisted.
        MedicineImportService.uploadBufferStore.delete(payload.uploadId);

        return {
            jobId: job.jobId,
            state: job.state,
            stats: {
                totalRows: job.totalRows,
                validRows: job.validRows,
                warningRows: job.warningRows,
                invalidRows: job.invalidRows
            },
            mapping: mappingDecisions
        };
    }

    public async getJobSummary(jobId: string): Promise<Record<string, any>> {
        const job = await this.jobRepository.findByJobId(jobId);
        if (!job) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                "Import job not found"
            );
        }

        const executionBreakdown = await this.rowRepository.getExecutionBreakdown(jobId);

        return {
            jobId: job.jobId,
            uploadId: job.uploadId,
            state: job.state,
            mode: job.mode,
            dryRun: job.dryRun,
            sheetName: job.sheetName,
            headerRowIndex: job.headerRowIndex,
            stats: {
                totalRows: job.totalRows,
                validRows: job.validRows,
                warningRows: job.warningRows,
                invalidRows: job.invalidRows
            },
            execution: {
                pending: executionBreakdown.PENDING || 0,
                processing: executionBreakdown.PROCESSING || 0,
                success: executionBreakdown.SUCCESS || 0,
                failedRetryable: executionBreakdown.FAILED_RETRYABLE || 0,
                failedPermanent: executionBreakdown.FAILED_PERMANENT || 0
            },
            summary: job.summaryJson,
            cancelRequested: job.cancelRequested,
            approvedAt: job.approvedAt,
            startedAt: job.startedAt,
            finishedAt: job.finishedAt,
            createdAt: job.createdAt,
            updatedAt: job.updatedAt
        };
    }

    public async getJobRows(
        jobId: string,
        page: number,
        pageSize: number,
        validationStatus?: string,
        executionStatus?: string
    ): Promise<Record<string, any>> {
        const job = await this.jobRepository.findByJobId(jobId);
        if (!job) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                "Import job not found"
            );
        }

        const safePage = Number.isFinite(page) && page > 0 ? page : 1;
        const safePageSize = Number.isFinite(pageSize) ? Math.min(Math.max(pageSize, 1), 200) : 50;

        const { rows, total } = await this.rowRepository.findRowsByJobId(
            jobId,
            safePage,
            safePageSize,
            validationStatus,
            executionStatus
        );

        return {
            items: rows.map((row) => ({
                rowId: row.rowId,
                rowNumber: row.rowNumber,
                validationStatus: row.validationStatus,
                executionStatus: row.executionStatus,
                mappedPayload: row.mappedPayloadJson,
                errors: row.errorCodesJson || []
            })),
            page: safePage,
            pageSize: safePageSize,
            total
        };
    }

    public async updateJobRow(
        jobId: string,
        rowNumber: number,
        overrides: Partial<MappedMedicinePayload>
    ): Promise<Record<string, any>> {
        const job = await this.jobRepository.findByJobId(jobId);
        if (!job) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                "Import job not found"
            );
        }

        if (job.state !== "REVIEW_REQUIRED") {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Rows can be edited only when job is in REVIEW_REQUIRED state"
            );
        }

        const row = await this.rowRepository.findRowByJobAndRowNumber(jobId, rowNumber);
        if (!row) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                "Import row not found"
            );
        }

        const allowedFields = new Set(["medicineName", "medicineCode", "composition", "categoryCode"]);
        const sanitizedOverrides = Object.keys(overrides || {}).reduce((acc: Record<string, string>, key) => {
            if (allowedFields.has(key)) {
                acc[key] = this.toNormalizedCellString((overrides as any)[key]);
            }
            return acc;
        }, {});

        if (Object.keys(sanitizedOverrides).length === 0) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "No valid fields were provided for row update"
            );
        }

        const currentPayload: MappedMedicinePayload = {
            medicineName: row.mappedPayloadJson?.medicineName || "",
            medicineCode: row.mappedPayloadJson?.medicineCode || "",
            composition: row.mappedPayloadJson?.composition || "",
            categoryCode: row.mappedPayloadJson?.categoryCode || ""
        };

        const updatedPayload: MappedMedicinePayload = {
            ...currentPayload,
            ...sanitizedOverrides
        };

        const categoryCodes = await this.fetchCategoryCodeSet();
        const existingMedicines = await this.medicineRepository.findAllMedicines();
        const existingMedicineCodeSet = new Set(existingMedicines.map((medicine) => medicine.medicineCode.toLowerCase()));
        const existingMedicineNameSet = new Set(existingMedicines.map((medicine) => medicine.medicineName.toLowerCase()));

        const errors = this.validateMappedPayload(
            updatedPayload,
            categoryCodes,
            existingMedicineCodeSet,
            existingMedicineNameSet,
            new Set<string>(),
            job.mode
        );

        if (updatedPayload.medicineCode) {
            const hasDuplicateInFile = await this.rowRepository.existsAnotherRowWithMedicineCode(
                jobId,
                updatedPayload.medicineCode,
                rowNumber
            );
            if (hasDuplicateInFile) {
                errors.push({
                    code: "VAL_DUPLICATE_CODE_IN_FILE",
                    message: `Duplicate medicineCode '${updatedPayload.medicineCode}' in uploaded file`
                });
            }
        }

        row.mappedPayloadJson = updatedPayload;
        row.validationStatus = errors.length === 0 ? "VALID" : "INVALID";
        row.executionStatus = "PENDING";
        row.errorCodesJson = errors.length > 0 ? errors : null;
        row.errorMessage = errors.length > 0 ? errors.map((error) => error.message).join(" | ") : null;
        row.medicineCode = updatedPayload.medicineCode || null;
        await this.rowRepository.saveRow(row);

        await this.refreshJobValidationSummary(job);

        return {
            rowId: row.rowId,
            rowNumber: row.rowNumber,
            validationStatus: row.validationStatus,
            executionStatus: row.executionStatus,
            mappedPayload: row.mappedPayloadJson,
            errors: row.errorCodesJson || []
        };
    }

    public async approveAndStartExecution(jobId: string): Promise<Record<string, any>> {
        const job = await this.jobRepository.findByJobId(jobId);
        if (!job) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                "Import job not found"
            );
        }

        if (job.state !== "REVIEW_REQUIRED" && job.state !== "PARTIAL_SUCCESS") {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                `Cannot approve import job in '${job.state}' state`
            );
        }

        if (job.validRows <= 0) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "No valid rows available for execution"
            );
        }

        if (MedicineImportService.runningJobIds.has(jobId)) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Import job is already running"
            );
        }

        job.cancelRequested = false;
        job.approvedAt = new Date();
        job.startedAt = null;
        job.finishedAt = null;
        job.state = "QUEUED";
        await this.jobRepository.updateJob(job);

        void this.executeQueuedJob(jobId);

        return {
            jobId,
            state: "QUEUED",
            message: "Import execution has started"
        };
    }

    public async cancelJobExecution(jobId: string): Promise<Record<string, any>> {
        const job = await this.jobRepository.findByJobId(jobId);
        if (!job) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                "Import job not found"
            );
        }

        if (!["QUEUED", "RUNNING", "RETRYING"].includes(job.state)) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                `Cannot cancel import job in '${job.state}' state`
            );
        }

        job.cancelRequested = true;
        await this.jobRepository.updateJob(job);

        return {
            jobId,
            state: job.state,
            cancelRequested: true,
            message: "Cancel requested. Running execution will stop safely."
        };
    }

    public async retryFailedRows(jobId: string, retryFilter = "FAILED_RETRYABLE"): Promise<Record<string, any>> {
        const job = await this.jobRepository.findByJobId(jobId);
        if (!job) {
            throw new ResourceNotFoundException(
                HttpResponseStatusCodesConstants.NOT_FOUND_FAILURE,
                "Import job not found"
            );
        }

        if (!["PARTIAL_SUCCESS", "FAILED", "CANCELLED"].includes(job.state)) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                `Cannot retry failed rows in '${job.state}' state`
            );
        }

        await this.rowRepository.resetRowsForRetry(jobId, retryFilter);

        job.cancelRequested = false;
        job.finishedAt = null;
        job.state = "RETRYING";
        await this.jobRepository.updateJob(job);

        void this.executeQueuedJob(jobId);

        return {
            jobId,
            state: "RETRYING",
            retryFilter,
            message: "Retry execution has started"
        };
    }

    private async executeQueuedJob(jobId: string): Promise<void> {
        if (MedicineImportService.runningJobIds.has(jobId)) {
            return;
        }

        MedicineImportService.runningJobIds.add(jobId);

        try {
            const job = await this.jobRepository.findByJobId(jobId);
            if (!job) {
                return;
            }

            job.state = "RUNNING";
            job.startedAt = job.startedAt || new Date();
            await this.jobRepository.updateJob(job);

            const executableRows = await this.rowRepository.findExecutableRows(jobId);

            for (const row of executableRows) {
                const currentJob = await this.jobRepository.findByJobId(jobId);
                if (!currentJob) {
                    return;
                }

                if (currentJob.cancelRequested) {
                    currentJob.state = "CANCELLED";
                    currentJob.finishedAt = new Date();
                    await this.jobRepository.updateJob(currentJob);
                    return;
                }

                row.executionStatus = "PROCESSING";
                await this.rowRepository.saveRow(row);

                const payload: MappedMedicinePayload = {
                    medicineName: row.mappedPayloadJson?.medicineName || "",
                    medicineCode: row.mappedPayloadJson?.medicineCode || "",
                    composition: row.mappedPayloadJson?.composition || "",
                    categoryCode: row.mappedPayloadJson?.categoryCode || ""
                };

                try {
                    await this.addOrUpsertMedicine(payload, job.mode);
                    row.executionStatus = "SUCCESS";
                    row.errorCodesJson = null;
                    row.errorMessage = null;
                } catch (error: any) {
                    row.retriesAttempted += 1;
                    const isRetryable = this.isRetryableExecutionError(error);
                    row.executionStatus = isRetryable ? "FAILED_RETRYABLE" : "FAILED_PERMANENT";
                    row.errorCodesJson = [{
                        code: isRetryable ? "EXEC_RETRYABLE" : "EXEC_PERMANENT",
                        message: error?.message || "Execution failed"
                    }];
                    row.errorMessage = error?.message || "Execution failed";
                }

                await this.rowRepository.saveRow(row);
            }

            const finalJob = await this.jobRepository.findByJobId(jobId);
            if (!finalJob) {
                return;
            }

            const breakdown = await this.rowRepository.getExecutionBreakdown(jobId);
            const failedCount = (breakdown.FAILED_RETRYABLE || 0) + (breakdown.FAILED_PERMANENT || 0);

            if (finalJob.cancelRequested) {
                finalJob.state = "CANCELLED";
            } else if (failedCount > 0) {
                finalJob.state = "PARTIAL_SUCCESS";
            } else {
                finalJob.state = "SUCCEEDED";
            }
            finalJob.finishedAt = new Date();
            await this.jobRepository.updateJob(finalJob);
        } catch {
            const failedJob = await this.jobRepository.findByJobId(jobId);
            if (failedJob) {
                failedJob.state = "FAILED";
                failedJob.finishedAt = new Date();
                await this.jobRepository.updateJob(failedJob);
            }
        } finally {
            MedicineImportService.runningJobIds.delete(jobId);
        }
    }

    private async refreshJobValidationSummary(job: MedicineImportJobSchema): Promise<void> {
        const validationBreakdown = await this.rowRepository.getValidationBreakdown(job.jobId);
        const validRows = validationBreakdown.VALID || 0;
        const warningRows = validationBreakdown.WARNING || 0;
        const invalidRows = validationBreakdown.INVALID || 0;
        const totalRows = validRows + warningRows + invalidRows;

        job.totalRows = totalRows;
        job.validRows = validRows;
        job.warningRows = warningRows;
        job.invalidRows = invalidRows;
        await this.jobRepository.updateJob(job);
    }

    private isRetryableExecutionError(error: any): boolean {
        if (error instanceof AbstractException) {
            return error.statusCode >= HttpResponseStatusCodesConstants.INTERNAL_SERVER_FAILURE;
        }
        return true;
    }

    private validateUploadMetadata(payload: CreateUploadSessionRequestModel): void {
        if (!payload.fileName || !payload.mimeType || !payload.sizeBytes) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "fileName, mimeType and sizeBytes are required"
            );
        }
        this.validateUploadedFile(payload.mimeType, payload.sizeBytes);
    }

    private validateUploadedFile(mimeType: string, sizeBytes: number): void {
        const allowedMimeTypes = new Set<string>([
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-excel"
        ]);

        if (!allowedMimeTypes.has(mimeType)) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                "Only Excel files are allowed"
            );
        }
        if (sizeBytes <= 0 || sizeBytes > this.maxUploadSizeBytes) {
            throw new BadRequestException(
                HttpResponseStatusCodesConstants.BAD_REQUEST_FAILURE,
                `File size should be between 1 and ${this.maxUploadSizeBytes} bytes`
            );
        }
    }

    private detectHeaderRowCandidates(worksheet: ExcelJS.Worksheet): number[] {
        const maxRowsToScan = Math.min(worksheet.rowCount, 30);
        const candidates: number[] = [];

        for (let rowNumber = 1; rowNumber <= maxRowsToScan; rowNumber++) {
            const row = worksheet.getRow(rowNumber);
            const rowValues = row.values as ExcelJS.CellValue[];
            const nonEmptyCellCount = rowValues
                .slice(1)
                .map((value: ExcelJS.CellValue) => this.toNormalizedCellString(value))
                .filter((value: string) => value.length > 0)
                .length;
            if (nonEmptyCellCount >= 2) {
                candidates.push(rowNumber);
            }
        }

        return candidates.length > 0 ? candidates : [1];
    }

    private extractHeaders(worksheet: ExcelJS.Worksheet, headerRowIndex: number): string[] {
        const headerRow = worksheet.getRow(headerRowIndex);
        const values = (headerRow.values as ExcelJS.CellValue[]).slice(1);
        return values.map((value, index) => {
            const normalized = this.toNormalizedCellString(value);
            return normalized || `column_${index + 1}`;
        });
    }

    private buildHeaderMap(headers: string[]): {
        headerMap: HeaderMap;
        mappingDecisions: MappingDecisionModel[];
    } {
        const synonyms: Record<string, Array<HeaderMap[keyof HeaderMap]>> = {
            medicineName: ["medicineName"],
            medicineCode: ["medicineCode"],
            composition: ["composition"],
            categoryCode: ["categoryCode"]
        };

        const synonymLookup: Record<string, HeaderMap[keyof HeaderMap]> = {
            medicinename: "medicineName",
            name: "medicineName",
            productname: "medicineName",
            drugname: "medicineName",
            medicinecode: "medicineCode",
            code: "medicineCode",
            medcode: "medicineCode",
            sku: "medicineCode",
            composition: "composition",
            ingredients: "composition",
            saltcomposition: "composition",
            salts: "composition",
            categorycode: "categoryCode",
            category: "categoryCode",
            catcode: "categoryCode"
        };

        const mappedTargets = new Set<string>();
        const headerMap: HeaderMap = {};
        const mappingDecisions: MappingDecisionModel[] = [];

        headers.forEach((header, index) => {
            const compactHeader = header.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            const mappedTarget = synonymLookup[compactHeader];

            if (mappedTarget && !mappedTargets.has(mappedTarget)) {
                headerMap[(index + 1).toString()] = mappedTarget;
                mappedTargets.add(mappedTarget);
                mappingDecisions.push({
                    source: header,
                    target: mappedTarget,
                    confidence: synonyms[mappedTarget][0] === mappedTarget ? 0.98 : 0.9,
                    mapperType: "RULE"
                });
            } else {
                mappingDecisions.push({
                    source: header,
                    target: null,
                    confidence: 0,
                    mapperType: "UNMAPPED"
                });
            }
        });

        return { headerMap, mappingDecisions };
    }

    private buildOriginalPayload(headers: string[], rowValues: ExcelJS.CellValue[]): Record<string, string> {
        const payload: Record<string, string> = {};
        headers.forEach((header, index) => {
            payload[header] = this.toNormalizedCellString(rowValues[index + 1]);
        });
        return payload;
    }

    private mapRowToMedicinePayload(rowValues: ExcelJS.CellValue[], headerMap: HeaderMap): MappedMedicinePayload {
        const mappedPayload: MappedMedicinePayload = {
            medicineName: "",
            medicineCode: "",
            composition: "",
            categoryCode: ""
        };

        Object.keys(headerMap).forEach((columnIndexString) => {
            const columnIndex = Number(columnIndexString);
            const targetField = headerMap[columnIndexString];
            mappedPayload[targetField] = this.toNormalizedCellString(rowValues[columnIndex]);
        });

        return mappedPayload;
    }

    private validateMappedPayload(
        payload: MappedMedicinePayload,
        categoryCodes: Set<string>,
        existingMedicineCodeSet: Set<string>,
        existingMedicineNameSet: Set<string>,
        seenMedicineCodes: Set<string>,
        mode: string = "CREATE_ONLY"
    ): ImportRowErrorModel[] {
        const errors: ImportRowErrorModel[] = [];

        if (!payload.medicineName) {
            errors.push({ code: "VAL_REQUIRED_MEDICINE_NAME", message: "medicineName is required" });
        }
        if (!payload.medicineCode) {
            errors.push({ code: "VAL_REQUIRED_MEDICINE_CODE", message: "medicineCode is required" });
        }
        if (!payload.composition) {
            errors.push({ code: "VAL_REQUIRED_COMPOSITION", message: "composition is required" });
        }
        if (!payload.categoryCode) {
            errors.push({ code: "VAL_REQUIRED_CATEGORY_CODE", message: "categoryCode is required" });
        }

        if (payload.categoryCode && !categoryCodes.has(payload.categoryCode.toLowerCase())) {
            errors.push({
                code: "VAL_CATEGORY_NOT_FOUND",
                message: `Category code '${payload.categoryCode}' does not exist`
            });
        }

        if (payload.medicineCode) {
            const lowerCode = payload.medicineCode.toLowerCase();
            if (seenMedicineCodes.has(lowerCode)) {
                errors.push({
                    code: "VAL_DUPLICATE_CODE_IN_FILE",
                    message: `Duplicate medicineCode '${payload.medicineCode}' in uploaded file`
                });
            }
            if (mode !== "UPSERT" && existingMedicineCodeSet.has(lowerCode)) {
                errors.push({
                    code: "VAL_DUPLICATE_CODE_DB",
                    message: `medicineCode '${payload.medicineCode}' already exists`
                });
            }
        }

        if (mode !== "UPSERT" && payload.medicineName && existingMedicineNameSet.has(payload.medicineName.toLowerCase())) {
            errors.push({
                code: "VAL_DUPLICATE_NAME_DB",
                message: `medicineName '${payload.medicineName}' already exists`
            });
        }

        return errors;
    }

    private async addOrUpsertMedicine(payload: MappedMedicinePayload, mode: string): Promise<void> {
        if (mode === "UPSERT") {
            const existingByCode = await this.medicineRepository.findMedicineByMedicineCode(payload.medicineCode);
            if (existingByCode) {
                await this.medicineService.updateMedicineDetails(payload.medicineCode, {
                    medicineName: payload.medicineName,
                    composition: payload.composition,
                    categoryCode: payload.categoryCode
                });
                return;
            }

            const existingByName = await this.medicineRepository.findMedicineByMedicineName(payload.medicineName);
            if (existingByName) {
                await this.medicineService.updateMedicineDetails(existingByName.medicineCode, {
                    medicineName: payload.medicineName,
                    composition: payload.composition,
                    categoryCode: payload.categoryCode
                });
                return;
            }
        }

        await this.medicineService.addMedicineDetails(payload);
    }

    private async fetchCategoryCodeSet(): Promise<Set<string>> {
        const categories = await this.categoryRepository.find();
        return new Set(categories.map((category) => category.categoryCode.toLowerCase()));
    }

    private cleanupExpiredUploadBuffers(): void {
        const now = Date.now();
        const ttlMs = this.uploadExpiryMinutes * 60 * 1000;
        for (const [uploadId, value] of MedicineImportService.uploadBufferStore.entries()) {
            if (now - value.createdAt > ttlMs) {
                MedicineImportService.uploadBufferStore.delete(uploadId);
            }
        }
    }

    private toNormalizedCellString(value: ExcelJS.CellValue | undefined): string {
        if (value === undefined || value === null) {
            return "";
        }
        if (typeof value === "object") {
            if ("text" in value && typeof value.text === "string") {
                return value.text.trim();
            }
            if ("result" in value && value.result !== null && value.result !== undefined) {
                return String(value.result).trim();
            }
            return String((value as any).toString?.() || "").trim();
        }
        return String(value).trim();
    }

    private isRowEmpty(values: any[]): boolean {
        return values.every((value) => this.toNormalizedCellString(value as ExcelJS.CellValue).length === 0);
    }

}
