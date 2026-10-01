import { useQuery } from '@tanstack/react-query'
import { OrderService } from '../../services/OrderService'

const orderService = new OrderService()

export const orderQueryKeys = {
    userOrders: ['orders', 'userOrders'] as const,
    quickRefills: ['orders', 'quickRefills'] as const,
}

export const useUserOrdersQuery = () =>
    useQuery({
        queryKey: orderQueryKeys.userOrders,
        queryFn: async () => orderService.getUserOrders(),
        retry: false,
    })

export const useQuickRefillsQuery = (isEnabled: boolean) =>
    useQuery({
        queryKey: orderQueryKeys.quickRefills,
        queryFn: async () => orderService.getQuickRefillMedicines(),
        enabled: isEnabled,
        retry: false,
    })
