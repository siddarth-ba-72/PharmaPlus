import { ApiEndpoints } from '../shared/api/ApiEndpoints'
import type { OrderRequestDto, OrderResponseDto, UserOrderResponseDto } from '../shared/dto/OrderDto'
import type { ResponseDto } from '../shared/dto/ResponseDto'
import { AbstractService } from './AbstractService'
import axios from 'axios'

type PlaceOrderResponseDto = {
    message?: string
    order?: OrderResponseDto
}

type UserOrdersResponseDto = {
    message?: string
    userOrders?: UserOrderResponseDto[]
}

export class OrderService extends AbstractService {
    private getBackendErrorMessage(error: unknown, fallbackMessage: string): string {
        if (axios.isAxiosError(error)) {
            if (error.response?.status === 204) {
                return ''
            }

            const responseData = error.response?.data as
                | {
                    message?: string
                    error?: string | { message?: string }
                    data?: { message?: string }
                }
                | undefined

            if (typeof responseData?.error === 'object' && responseData.error?.message) {
                return responseData.error.message
            }

            if (typeof responseData?.error === 'string') {
                return responseData.error
            }

            if (responseData?.data?.message) {
                return responseData.data.message
            }

            if (responseData?.message) {
                return responseData.message
            }
        }

        if (error instanceof Error) {
            return error.message
        }

        return fallbackMessage
    }

    async placeOrder(orderRequest: OrderRequestDto): Promise<OrderResponseDto> {
        const response = await this.post<ResponseDto<PlaceOrderResponseDto>, OrderRequestDto>(ApiEndpoints.NEW_ORDER, orderRequest)

        if (!response.success || !response.data.order) {
            throw new Error(response.data.message ?? 'Could not place the order.')
        }

        return response.data.order
    }

    async getUserOrders(): Promise<UserOrderResponseDto[]> {
        try {
            const response = await this.get<ResponseDto<UserOrdersResponseDto> | ''>(ApiEndpoints.MY_ORDERS)

            if (!response || typeof response === 'string') {
                return []
            }

            if (!response.success) {
                const backendMessage = response.data?.message ?? ''
                if (/no orders/i.test(backendMessage)) {
                    return []
                }
                throw new Error(backendMessage || 'Could not fetch user orders.')
            }

            return response.data.userOrders ?? []
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 204) {
                return []
            }

            const message = this.getBackendErrorMessage(error, 'Could not fetch user orders.')
            if (/no orders/i.test(message)) {
                return []
            }
            throw new Error(message)
        }
    }
}
