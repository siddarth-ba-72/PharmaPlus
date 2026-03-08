import { useMemo, useState, type FormEvent } from 'react'
import { useUpdateMedicineStockMutation } from '../../shared/queries/AdminQueries'
import { useMedicinesQuery } from '../../shared/queries/MedicineQueries'
import { useToastStore } from '../../store/ToastStore'
import { AdminUpdateMedicineComponentView } from './AdminUpdateMedicineComponentView'

export const AdminUpdateMedicineComponent = () => {
    const [medicineCode, setMedicineCode] = useState('')
    const [price, setPrice] = useState('')
    const [quantity, setQuantity] = useState('')
    const [isCodeFocused, setIsCodeFocused] = useState(false)
    const medicinesQuery = useMedicinesQuery()
    const updateStockMutation = useUpdateMedicineStockMutation()
    const showToast = useToastStore((state) => state.showToast)

    const medicineSuggestions = useMemo(() => {
        const query = medicineCode.trim().toLowerCase()
        if (query.length === 0) {
            return []
        }

        return (medicinesQuery.data ?? [])
            .filter((medicine) => medicine.medicineCode.toLowerCase().includes(query))
            .slice(0, 8)
            .map((medicine) => ({
                code: medicine.medicineCode,
                name: medicine.medicineName,
            }))
    }, [medicineCode, medicinesQuery.data])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()

        try {
            const message = await updateStockMutation.mutateAsync({
                medicineCode,
                price: Number(price),
                quantity: Number(quantity),
            })
            showToast({ category: 'success', message })
            setPrice('')
            setQuantity('')
        } catch (error) {
            showToast({
                category: 'fail',
                message: error instanceof Error ? error.message : 'Unable to update medicine stock.',
            })
        }
    }

    return (
        <AdminUpdateMedicineComponentView
            medicineCode={medicineCode}
            price={price}
            quantity={quantity}
            medicineSuggestions={medicineSuggestions}
            showSuggestions={isCodeFocused && medicineSuggestions.length > 0}
            medicinesLoading={medicinesQuery.isLoading}
            medicinesError={medicinesQuery.error instanceof Error ? medicinesQuery.error.message : null}
            submitting={updateStockMutation.isPending}
            onMedicineCodeChange={setMedicineCode}
            onMedicineCodeFocus={() => setIsCodeFocused(true)}
            onMedicineCodeBlur={() => setTimeout(() => setIsCodeFocused(false), 120)}
            onSuggestionSelect={(value) => setMedicineCode(value)}
            onPriceChange={setPrice}
            onQuantityChange={setQuantity}
            onSubmit={handleSubmit}
        />
    )
}
