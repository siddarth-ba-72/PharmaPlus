import { ApiEndpoints } from '../shared/api/ApiEndpoints'
import type { AllUsersResponseDto, ModifyStockRequestDto, SaveMedicineRequestDto } from '../shared/dto/AdminApiDto'
import type { ResponseDto } from '../shared/dto/ResponseDto'
import type { UserDto } from '../shared/dto/UserDto'
import { AbstractService } from './AbstractService'

type UploadSessionResponse = {
    uploadId: string
    uploadUrl: string
    expiresAt: string
    maxSizeBytes: number
}

type UploadCompleteResponse = {
    uploadId: string
    sheets: string[]
    detectedHeaderRowCandidates: number[]
}

type PreviewJobResponse = {
    jobId: string
    state: string
    stats: {
        totalRows: number
        validRows: number
        warningRows: number
        invalidRows: number
    }
}

type JobSummaryResponse = PreviewJobResponse & {
    execution: {
        pending: number
        processing: number
        success: number
        failedRetryable: number
        failedPermanent: number
    }
    cancelRequested?: boolean
    approvedAt?: string | null
    startedAt?: string | null
    finishedAt?: string | null
}

type PreviewRowsResponse = {
    items: Array<{
        rowId: number
        rowNumber: number
        validationStatus: string
        executionStatus: string
        mappedPayload: Record<string, string>
        errors: Array<{ code: string; message: string }>
    }>
    page: number
    pageSize: number
    total: number
}

export class AdminService extends AbstractService {
    async getAllUsers(): Promise<UserDto[]> {
        const response = await this.get<ResponseDto<AllUsersResponseDto>>(ApiEndpoints.ALL_USERS)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not fetch users.')
        }

        return response.data.users ?? []
    }

    async addMedicine(payload: SaveMedicineRequestDto): Promise<string> {
        const response = await this.post<ResponseDto<Record<string, never>>, SaveMedicineRequestDto>(
            ApiEndpoints.SAVE_MEDICINE,
            payload,
        )

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not add medicine.')
        }

        return response.data.message ?? 'Medicine added successfully.'
    }

    async updateMedicineStock(payload: ModifyStockRequestDto): Promise<string> {
        const response = await this.post<ResponseDto<Record<string, never>>, ModifyStockRequestDto>(
            ApiEndpoints.MODIFY_STOCK,
            payload,
        )

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not update medicine stock.')
        }

        return response.data.message ?? 'Medicine stock updated successfully.'
    }

    async createMedicineImportUploadSession(file: File): Promise<UploadSessionResponse> {
        const response = await this.post<ResponseDto<UploadSessionResponse>, {
            fileName: string
            mimeType: string
            sizeBytes: number
        }>(
            ApiEndpoints.MEDICINE_IMPORT_UPLOADS,
            {
                fileName: file.name,
                mimeType: file.type,
                sizeBytes: file.size,
            },
        )

        if (!response.success) {
            throw new Error((response as any).error?.message ?? 'Could not create upload session.')
        }

        return response.data
    }

    async completeMedicineImportUpload(uploadId: string, file: File): Promise<UploadCompleteResponse> {
        const formData = new FormData()
        formData.append('file', file)

        const response = await this.post<ResponseDto<UploadCompleteResponse>, FormData>(
            `${ApiEndpoints.MEDICINE_IMPORT_UPLOADS}/${uploadId}/complete`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            },
        )

        if (!response.success) {
            throw new Error((response as any).error?.message ?? 'Could not complete upload.')
        }

        return response.data
    }

    async createMedicineImportPreviewJob(payload: {
        uploadId: string
        sheetName?: string
        headerRowIndex?: number
        mode?: string
        dryRun?: boolean
    }): Promise<PreviewJobResponse> {
        const response = await this.post<ResponseDto<PreviewJobResponse>, typeof payload>(
            ApiEndpoints.MEDICINE_IMPORT_JOBS,
            payload,
        )

        if (!response.success) {
            throw new Error((response as any).error?.message ?? 'Could not create import preview job.')
        }

        return response.data
    }

    async getMedicineImportRows(jobId: string, validationStatus?: string): Promise<PreviewRowsResponse> {
        const query = new URLSearchParams({
            page: '1',
            pageSize: '20',
        })

        if (validationStatus) {
            query.set('validationStatus', validationStatus)
        }

        const response = await this.get<ResponseDto<PreviewRowsResponse>>(
            `${ApiEndpoints.MEDICINE_IMPORT_JOBS}/${jobId}/rows?${query.toString()}`,
        )

        if (!response.success) {
            throw new Error((response as any).error?.message ?? 'Could not fetch import rows.')
        }

        return response.data
    }

    async getMedicineImportJobSummary(jobId: string): Promise<JobSummaryResponse> {
        const response = await this.get<ResponseDto<JobSummaryResponse>>(
            `${ApiEndpoints.MEDICINE_IMPORT_JOBS}/${jobId}`,
        )

        if (!response.success) {
            throw new Error((response as any).error?.message ?? 'Could not fetch import job summary.')
        }

        return response.data
    }

    async approveAndStartMedicineImport(jobId: string): Promise<{ jobId: string; state: string; message: string }> {
        const response = await this.post<ResponseDto<{ jobId: string; state: string; message: string }>>(
            `${ApiEndpoints.MEDICINE_IMPORT_JOBS}/${jobId}/approve`,
            {},
        )

        if (!response.success) {
            throw new Error((response as any).error?.message ?? 'Could not start medicine import execution.')
        }

        return response.data
    }

    async cancelMedicineImport(jobId: string): Promise<{ jobId: string; state: string; message: string }> {
        const response = await this.post<ResponseDto<{ jobId: string; state: string; message: string }>>(
            `${ApiEndpoints.MEDICINE_IMPORT_JOBS}/${jobId}/cancel`,
            {},
        )

        if (!response.success) {
            throw new Error((response as any).error?.message ?? 'Could not cancel medicine import execution.')
        }

        return response.data
    }

    async retryFailedMedicineImportRows(
        jobId: string,
        retryFilter: 'FAILED_RETRYABLE' | 'FAILED_PERMANENT' = 'FAILED_RETRYABLE',
    ): Promise<{ jobId: string; state: string; message: string }> {
        const response = await this.post<ResponseDto<{ jobId: string; state: string; message: string }>, { retryFilter: string }>(
            `${ApiEndpoints.MEDICINE_IMPORT_JOBS}/${jobId}/retry-failed`,
            { retryFilter },
        )

        if (!response.success) {
            throw new Error((response as any).error?.message ?? 'Could not retry failed medicine import rows.')
        }

        return response.data
    }
}
