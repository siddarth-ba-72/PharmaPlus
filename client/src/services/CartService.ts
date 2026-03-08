import { ApiEndpoints } from '../shared/api/ApiEndpoints'
import type { CartRequestDto, CartResponseDto } from '../shared/dto/CartDto'
import type { ResponseDto } from '../shared/dto/ResponseDto'
import { AbstractService } from './AbstractService'

type ModifyCartResponseDto = {
    message?: string
    userCartItems?: CartResponseDto[]
}

type UserCartResponseDto = {
    message?: string
    userCartItems?: CartResponseDto[]
}

export class CartService extends AbstractService {
    async saveCartItems(items: CartRequestDto[]): Promise<string> {
        const response = await this.post<ResponseDto<ModifyCartResponseDto>, CartRequestDto[]>(ApiEndpoints.MODIFY_CART, items)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not save cart.')
        }

        return response.data.message ?? 'Cart saved successfully.'
    }

    async getUserCartItems(): Promise<CartResponseDto[]> {
        const response = await this.get<ResponseDto<UserCartResponseDto>>(ApiEndpoints.USER_CART)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not fetch cart items.')
        }

        return response.data.userCartItems ?? []
    }
}
