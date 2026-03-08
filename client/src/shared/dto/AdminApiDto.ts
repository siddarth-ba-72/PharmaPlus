import type { UserDto } from './UserDto'

export interface AllUsersResponseDto {
    users: UserDto[] | null
    message?: string
}

export interface SaveMedicineRequestDto {
    medicineName: string
    medicineCode: string
    composition: string
    categoryCode: string
}

export interface ModifyStockRequestDto {
    medicineCode: string
    price: number
    quantity: number
}
