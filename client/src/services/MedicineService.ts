import { ApiEndpoints } from '../shared/api/ApiEndpoints'
import type { MedicineStockResponseDto, MedicineStocksResponseDto, MedicinesResponseDto } from '../shared/dto/MedicineApiDto'
import type { MedicineDto } from '../shared/dto/MedicineDto'
import type { MedicineStockDto } from '../shared/dto/MedicineStockDto'
import type { ResponseDto } from '../shared/dto/ResponseDto'
import { AbstractService } from './AbstractService'

export class MedicineService extends AbstractService {
    async getAllMedicines(): Promise<MedicineDto[]> {
        const response = await this.get<ResponseDto<MedicinesResponseDto>>(ApiEndpoints.ALL_MEDICINES)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not fetch medicines.')
        }

        return response.data.medicines ?? []
    }

    async getMedicineStock(medicineCode: string): Promise<MedicineStockDto> {
        const response = await this.get<ResponseDto<MedicineStockResponseDto>>(
            `${ApiEndpoints.MEDICINE_STOCK}/${medicineCode}`,
        )

        if (!response.success || !response.data.medicineStock) {
            throw new Error(response.data.message ?? 'Could not fetch medicine details.')
        }

        return response.data.medicineStock
    }

    async getAllMedicineStocks(): Promise<MedicineStockDto[]> {
        const response = await this.get<ResponseDto<MedicineStocksResponseDto>>(ApiEndpoints.ALL_MEDICINES_STOCK)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not fetch medicine stock.')
        }

        return response.data.medicineStocks ?? []
    }
}
