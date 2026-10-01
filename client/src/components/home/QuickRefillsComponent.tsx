import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { QuickRefillItem, QuickRefillsComponentViewProps } from '../../shared/props/PropModels'
import { useAuthStore } from '../../store/AuthStore'
import { useSaveCartMutation, useUserCartQuery } from '../../shared/queries/CartQueries'
import { useQuickRefillsQuery } from '../../shared/queries/OrderQueries'
import { useToastStore } from '../../store/ToastStore'
import { QuickRefillsComponentView } from './QuickRefillsComponentView'

export const QuickRefillsComponent = () => {
    const navigate = useNavigate()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const quickRefillsQuery = useQuickRefillsQuery(isAuthenticated)
    const userCartQuery = useUserCartQuery()
    const saveCartMutation = useSaveCartMutation()
    const showToast = useToastStore((state) => state.showToast)
    const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({})
    const [savingMedicineCode, setSavingMedicineCode] = useState<string | null>(null)

    const existingCartQuantityByCode = useMemo(
        () =>
            (userCartQuery.data ?? []).reduce<Record<string, number>>((accumulator, item) => {
                if (!item.medicineCode) {
                    return accumulator
                }
                accumulator[item.medicineCode] = item.quantity
                return accumulator
            }, {}),
        [userCartQuery.data],
    )

    if (!isAuthenticated) {
        return null
    }

    const getMaxSelectable = (availableStock: number | null, medicineCode: string): number | null => {
        if (availableStock === null) {
            return null
        }
        const remaining = availableStock - (existingCartQuantityByCode[medicineCode] ?? 0)
        return Math.max(0, remaining)
    }

    const items: QuickRefillItem[] = (quickRefillsQuery.data ?? []).map((medicine) => ({
        ...medicine,
        selectedQuantity: selectedQuantities[medicine.medicineCode] ?? 0,
    }))

    const handleIncrement = (medicineCode: string): void => {
        const medicine = items.find((item) => item.medicineCode === medicineCode)
        const maxSelectable = getMaxSelectable(medicine?.availableStock ?? null, medicineCode)

        setSelectedQuantities((current) => {
            const currentQuantity = current[medicineCode] ?? 0
            const nextQuantity = maxSelectable === null ? currentQuantity + 1 : Math.min(currentQuantity + 1, maxSelectable)
            return { ...current, [medicineCode]: nextQuantity }
        })
    }

    const handleDecrement = (medicineCode: string): void => {
        setSelectedQuantities((current) => {
            const currentQuantity = current[medicineCode] ?? 0
            return { ...current, [medicineCode]: Math.max(0, currentQuantity - 1) }
        })
    }

    const handleAddToCart = async (medicineCode: string): Promise<void> => {
        const selectedQuantity = selectedQuantities[medicineCode] ?? 0
        if (selectedQuantity <= 0) {
            showToast({ category: 'warn', message: 'Choose a quantity before adding to cart.' })
            return
        }

        const newQuantity = (existingCartQuantityByCode[medicineCode] ?? 0) + selectedQuantity

        setSavingMedicineCode(medicineCode)
        try {
            const message = await saveCartMutation.mutateAsync([{ medicineCode, quantity: newQuantity }])
            setSelectedQuantities((current) => ({ ...current, [medicineCode]: 0 }))
            showToast({
                category: 'success',
                message,
                actionLabel: 'Go to Cart',
                onAction: () => navigate('/pharma-plus/cart'),
            })
        } catch (error) {
            showToast({
                category: 'fail',
                message: error instanceof Error ? error.message : 'Unable to add to cart.',
            })
        } finally {
            setSavingMedicineCode(null)
        }
    }

    const viewProps: QuickRefillsComponentViewProps = {
        isAuthenticated,
        items,
        loading: quickRefillsQuery.isLoading,
        error: quickRefillsQuery.error instanceof Error ? quickRefillsQuery.error.message : null,
        savingMedicineCode,
        onIncrement: handleIncrement,
        onDecrement: handleDecrement,
        onAddToCart: handleAddToCart,
        onMedicineClick: (medicineCode) => navigate(`/pharma-plus/medicines/${medicineCode}`),
    }

    return <QuickRefillsComponentView {...viewProps} />
}
