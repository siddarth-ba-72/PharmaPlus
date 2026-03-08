import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CartRequestDto } from '../dto/CartDto'
import { CartService } from '../../services/CartService'

const cartService = new CartService()

export const cartQueryKeys = {
    userCart: ['cart', 'userCart'] as const,
}

export const useSaveCartMutation = () =>
{
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (items: CartRequestDto[]) => cartService.saveCartItems(items),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: cartQueryKeys.userCart })
        },
    })
}

export const useUserCartQuery = () =>
    useQuery({
        queryKey: cartQueryKeys.userCart,
        queryFn: async () => cartService.getUserCartItems(),
        retry: false,
    })
