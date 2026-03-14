export interface CreateUploadSessionRequestModel {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256?: string;
}

export interface CreatePreviewJobRequestModel {
    uploadId: string;
    sheetName?: string;
    headerRowIndex?: number;
    mode?: string;
    dryRun?: boolean;
}

export interface MappedMedicinePayload {
    medicineName: string;
    medicineCode: string;
    composition: string;
    categoryCode: string;
}

export interface ImportRowErrorModel {
    code: string;
    message: string;
}

export interface MappingDecisionModel {
    source: string;
    target: string | null;
    confidence: number;
    mapperType: "RULE" | "UNMAPPED";
}

export interface ImportJobSummaryModel {
    totalRows: number;
    validRows: number;
    warningRows: number;
    invalidRows: number;
    mapping: MappingDecisionModel[];
}
