import { useQuery } from '@tanstack/react-query'
import { MedicineService } from '../../services/MedicineService'

const medicineService = new MedicineService()

export const medicineQueryKeys = {
    allMedicines: ['medicine', 'allMedicines'] as const,
    allMedicineStocks: ['medicine', 'allMedicineStocks'] as const,
    medicineStock: (medicineCode: string) => ['medicine', 'stock', medicineCode] as const,
}

export const useMedicinesQuery = () =>
    useQuery({
        queryKey: medicineQueryKeys.allMedicines,
        queryFn: async () => medicineService.getAllMedicines(),
        retry: false,
    })

export const useMedicineStockQuery = (medicineCode: string) =>
    useQuery({
        queryKey: medicineQueryKeys.medicineStock(medicineCode),
        queryFn: async () => medicineService.getMedicineStock(medicineCode),
        enabled: medicineCode.length > 0,
        retry: false,
    })

export const useAllMedicineStocksQuery = () =>
    useQuery({
        queryKey: medicineQueryKeys.allMedicineStocks,
        queryFn: async () => medicineService.getAllMedicineStocks(),
        retry: false,
    })
