export interface CartRequestDto {
    medicineCode: string
    quantity: number
}

export interface CartResponseDto {
    medicineCode: string
    medicine: string
    quantity: number
}
