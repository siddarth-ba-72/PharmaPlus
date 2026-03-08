import type { MedicineDto } from './MedicineDto'
import type { MedicineStockDto } from './MedicineStockDto'

export interface MedicinesResponseDto {
    medicines: MedicineDto[] | null
    message?: string
}

export interface MedicineStockResponseDto {
    medicineStock?: MedicineStockDto
    message?: string
}

export interface MedicineStocksResponseDto {
    medicineStocks?: MedicineStockDto[]
    message?: string
}
