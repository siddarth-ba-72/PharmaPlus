import { useNavigate, useParams } from 'react-router-dom'
import { useEffect } from 'react'
import type { MedicineDetailsComponentViewProps } from '../../shared/props/PropModels'
import { useMedicineStockQuery } from '../../shared/queries/MedicineQueries'
import { MedicineDetailsComponentView } from './MedicineDetailsComponentView'
import { useAuthStore } from '../../store/AuthStore'
import { useCartStore } from '../../store/CartStore'
import { useSaveCartMutation, useUserCartQuery } from '../../shared/queries/CartQueries'
import { useToastStore } from '../../store/ToastStore'

export const MedicineDetailsComponent = () => {
    const navigate = useNavigate()
    const { medicineCode = '' } = useParams()
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const cartQuantity = useCartStore((state) => state.getQuantity(medicineCode))
    const setCartFromItems = useCartStore((state) => state.setFromItems)
    const incrementCart = useCartStore((state) => state.increment)
    const decrementCart = useCartStore((state) => state.decrement)
    const cartPayload = useCartStore((state) => state.toPayload)
    const userCartQuery = useUserCartQuery()
    const saveCartMutation = useSaveCartMutation()
    const showToast = useToastStore((state) => state.showToast)
    const medicineStockQuery = useMedicineStockQuery(medicineCode)

    useEffect(() => {
        if (!isAuthenticated || !userCartQuery.data) {
            return
        }
        setCartFromItems(userCartQuery.data)
    }, [isAuthenticated, setCartFromItems, userCartQuery.data])

    const handleSaveCart = async (): Promise<void> => {
        if (!isAuthenticated) {
            showToast({ category: 'fail', message: 'Please login to purchase.' })
            return
        }

        const items = cartPayload()
        if (items.length === 0) {
            showToast({ category: 'warn', message: 'Cart is empty.' })
            return
        }

        try {
            const message = await saveCartMutation.mutateAsync(items)
            showToast({ category: 'success', message })
        } catch (error) {
            showToast({
                category: 'fail',
                message: error instanceof Error ? error.message : 'Unable to save cart.',
            })
        }
    }

    const detailsViewProps: MedicineDetailsComponentViewProps = {
        medicineStock: medicineStockQuery.data ?? null,
        isAuthenticated,
        cartQuantity,
        savingCart: saveCartMutation.isPending,
        loading: medicineStockQuery.isLoading,
        error: medicineStockQuery.error instanceof Error ? medicineStockQuery.error.message : null,
        onAddToCart: () => incrementCart(medicineCode),
        onDecreaseFromCart: () => decrementCart(medicineCode),
        onSaveCart: handleSaveCart,
        onBackClick: () => navigate('/pharma-plus/medicines'),
    }

    return <MedicineDetailsComponentView {...detailsViewProps} />
}
