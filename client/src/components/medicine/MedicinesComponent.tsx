import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MedicinesComponentView } from './MedicinesComponentView'
import { MEDICINES_PER_PAGE } from '../../shared/constants/MedicinesConstants'
import { useAllMedicineStocksQuery, useMedicinesQuery } from '../../shared/queries/MedicineQueries'
import type { MedicineListItem, MedicinesComponentViewProps } from '../../shared/props/PropModels'

export const MedicinesComponent = () => {
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [minPrice, setMinPrice] = useState('')
    const [maxPrice, setMaxPrice] = useState('')
    const medicinesQuery = useMedicinesQuery()
    const medicineStocksQuery = useAllMedicineStocksQuery()

    const allMedicines = medicinesQuery.data ?? []
    const allMedicineStocks = medicineStocksQuery.data ?? []

    const stockByCode = useMemo(
        () =>
            allMedicineStocks.reduce<Record<string, { price: number; quantity: number }>>((accumulator, stock) => {
                if (!stock.medicineCode) {
                    return accumulator
                }
                accumulator[stock.medicineCode] = { price: stock.price, quantity: stock.quantity }
                return accumulator
            }, {}),
        [allMedicineStocks],
    )

    const categoryOptions = useMemo(
        () =>
            Array.from(
                new Set(
                    allMedicines
                        .map((medicine) => medicine.category)
                        .filter((category): category is string => Boolean(category && category.trim())),
                ),
            ).sort(),
        [allMedicines],
    )

    const filteredMedicines = useMemo<MedicineListItem[]>(() => {
        const min = minPrice === '' ? null : Number(minPrice)
        const max = maxPrice === '' ? null : Number(maxPrice)

        return allMedicines
            .filter((medicine) => {
                if (selectedCategory === 'all') {
                    return true
                }
                return medicine.category === selectedCategory
            })
            .filter((medicine) => {
                const stock = stockByCode[medicine.medicineCode]
                const price = stock?.price

                if (min !== null && (price === undefined || price < min)) {
                    return false
                }

                if (max !== null && (price === undefined || price > max)) {
                    return false
                }

                return true
            })
            .map((medicine) => ({
                medicineName: medicine.medicineName,
                medicineCode: medicine.medicineCode,
                composition: medicine.composition,
                category: medicine.category,
                price: stockByCode[medicine.medicineCode]?.price ?? null,
                quantity: stockByCode[medicine.medicineCode]?.quantity ?? null,
            }))
    }, [allMedicines, maxPrice, minPrice, selectedCategory, stockByCode])

    const totalPages = Math.max(1, Math.ceil(filteredMedicines.length / MEDICINES_PER_PAGE))
    const safeCurrentPage = Math.min(currentPage, totalPages)

    const currentMedicines = useMemo(() => {
        const startIndex = (safeCurrentPage - 1) * MEDICINES_PER_PAGE
        return filteredMedicines.slice(startIndex, startIndex + MEDICINES_PER_PAGE)
    }, [filteredMedicines, safeCurrentPage])

    const handlePageChange = (nextPage: number): void => {
        if (nextPage < 1 || nextPage > totalPages) {
            return
        }
        setCurrentPage(nextPage)
    }

    const handleMedicineClick = (medicineCode: string): void => {
        navigate(`/pharma-plus/medicines/${medicineCode}`)
    }

    const handleCategoryChange = (category: string): void => {
        setSelectedCategory(category)
        setCurrentPage(1)
    }

    const handleMinPriceChange = (value: string): void => {
        setMinPrice(value)
        setCurrentPage(1)
    }

    const handleMaxPriceChange = (value: string): void => {
        setMaxPrice(value)
        setCurrentPage(1)
    }

    const handleClearFilters = (): void => {
        setSelectedCategory('all')
        setMinPrice('')
        setMaxPrice('')
        setCurrentPage(1)
    }

    const medicinesViewProps: MedicinesComponentViewProps = {
        medicines: currentMedicines,
        currentPage: safeCurrentPage,
        totalPages,
        pageSize: MEDICINES_PER_PAGE,
        selectedCategory,
        categoryOptions,
        minPrice,
        maxPrice,
        loading: medicinesQuery.isLoading || medicineStocksQuery.isLoading,
        error:
            (medicinesQuery.error instanceof Error ? medicinesQuery.error.message : null) ??
            (medicineStocksQuery.error instanceof Error ? medicineStocksQuery.error.message : null),
        onCategoryChange: handleCategoryChange,
        onMinPriceChange: handleMinPriceChange,
        onMaxPriceChange: handleMaxPriceChange,
        onClearFilters: handleClearFilters,
        onPageChange: handlePageChange,
        onMedicineClick: handleMedicineClick,
    }

    return (
        <MedicinesComponentView {...medicinesViewProps} />
    );

};
