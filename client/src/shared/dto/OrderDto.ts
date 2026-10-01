export interface OrderRequestDto {
    paymentTypeCode: string
    expectedItems?: {
        medicineCode: string
        quantity: number
        unitPrice: number
    }[]
}

export interface OrderMedicineResponseDto {
    medicineName: string
    category: string
    quantity: number
    unitPrice: number
    lineTotal: number
}

export interface OrderResponseDto {
    user: string
    orderNumber: string
    transaction: string
    totalAmount: number
    medicines: OrderMedicineResponseDto[]
}

export interface UserOrderMedicineResponseDto {
    medicineName: string
    category: string
    quantity: number
    unitPrice: number
    totalPrice: number
}

export interface UserOrderResponseDto {
    orderNumber: string
    transaction: string
    paymentMethod: string
    medicines: UserOrderMedicineResponseDto[]
    totalAmount: number
    orderDate: string
    paymentDate: string
}

export interface QuickRefillMedicineDto {
    medicineCode: string
    medicineName: string
    category: string
    totalOrderedQuantity: number
    price: number | null
    availableStock: number | null
}
