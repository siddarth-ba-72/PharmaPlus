import axios from 'axios'
import { ApiEndpoints } from '../shared/api/ApiEndpoints'
import type { MedicineStockResponseDto, MedicineStocksResponseDto, MedicinesResponseDto } from '../shared/dto/MedicineApiDto'
import type { MedicineDto } from '../shared/dto/MedicineDto'
import type { MedicineStockDto } from '../shared/dto/MedicineStockDto'
import type { ResponseDto } from '../shared/dto/ResponseDto'
import { AbstractService } from './AbstractService'

export class MedicineService extends AbstractService {
    private getBackendErrorMessage(error: unknown, fallbackMessage: string): string {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 204) {
                return ''
            }

            const responseData = error.response?.data as
                | { message?: string; error?: string | { message?: string }; data?: { message?: string } }
                | undefined

            if (typeof responseData?.error === 'object' && responseData.error?.message) {
                return responseData.error.message
            }

            if (typeof responseData?.error === 'string') {
                return responseData.error
            }

            if (responseData?.data?.message) {
                return responseData.data.message
            }

            if (responseData?.message) {
                return responseData.message
            }
        }

        if (error instanceof Error) {
            return error.message
        }

        return fallbackMessage
    }

    async getAllMedicines(): Promise<MedicineDto[]> {
        try {
            const response = await this.get<ResponseDto<MedicinesResponseDto> | undefined>(ApiEndpoints.ALL_MEDICINES)

            if (!response || typeof response !== 'object') {
                return []
            }

            if (!response.success) {
                const backendMessage = response.data?.message ?? 'Could not fetch medicines.'
                if (/empty|no medicines/i.test(backendMessage)) {
                    return []
                }
                throw new Error(backendMessage)
            }

            return response.data?.medicines ?? []
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 204) {
                return []
            }

            const message = this.getBackendErrorMessage(error, 'Could not fetch medicines.')
            if (/empty|no medicines/i.test(message)) {
                return []
            }
            throw new Error(message)
        }
    }

    async getMedicineStock(medicineCode: string): Promise<MedicineStockDto> {
        try {
            const response = await this.get<ResponseDto<MedicineStockResponseDto> | undefined>(
                `${ApiEndpoints.MEDICINE_STOCK}/${medicineCode}`,
            )

            if (!response || typeof response !== 'object' || !response.success || !response.data?.medicineStock) {
                const message = response && typeof response === 'object' && response.data?.message
                    ? response.data.message
                    : 'Could not fetch medicine details.'
                if (/empty|no stock/i.test(message)) {
                    throw new Error('There are no stocks for this medicine.')
                }
                throw new Error(message)
            }

            return response.data.medicineStock
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 204) {
                throw new Error('There are no stocks for this medicine.')
            }
            throw error
        }
    }

    async getAllMedicineStocks(): Promise<MedicineStockDto[]> {
        try {
            const response = await this.get<ResponseDto<MedicineStocksResponseDto> | undefined>(ApiEndpoints.ALL_MEDICINES_STOCK)

            if (!response || typeof response !== 'object') {
                return []
            }

            if (!response.success) {
                const backendMessage = response.data?.message ?? 'Could not fetch medicine stock.'
                if (/empty|no stock/i.test(backendMessage)) {
                    return []
                }
                throw new Error(backendMessage)
            }

            return response.data?.medicineStocks ?? []
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 204) {
                return []
            }

            const message = this.getBackendErrorMessage(error, 'Could not fetch medicine stock.')
            if (/empty|no stock/i.test(message)) {
                return []
            }
            throw new Error(message)
        }
    }
}
