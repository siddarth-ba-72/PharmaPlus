import { useQuery } from '@tanstack/react-query'
import { OrderService } from '../../services/OrderService'

const orderService = new OrderService()

export const orderQueryKeys = {
    userOrders: ['orders', 'userOrders'] as const,
}

export const useUserOrdersQuery = () =>
    useQuery({
        queryKey: orderQueryKeys.userOrders,
        queryFn: async () => orderService.getUserOrders(),
        retry: false,
    })
