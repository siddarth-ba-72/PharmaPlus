export interface OrderRequestDto {
    paymentTypeCode: string
}

export interface OrderMedicineResponseDto {
    medicineName: string
    category: string
    quantity: number
    price?: number
}

export interface OrderResponseDto {
    user: string
    orderNumber: string
    transaction: string
    totalAmount: number
    medicines: OrderMedicineResponseDto[]
}

export interface UserOrderResponseDto {
    orderNumber: string
    transaction: string
    paymentMethod: string
    medicines: string[]
    totalAmount: number
    orderDate: string
    paymentDate: string
}
