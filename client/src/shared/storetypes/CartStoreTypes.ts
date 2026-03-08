import type { CartRequestDto } from '../dto/CartDto'
import type { CartResponseDto } from '../dto/CartDto'

export interface CartStoreState {
    items: Record<string, number>
    setFromItems: (items: CartResponseDto[]) => void
    increment: (medicineCode: string) => void
    decrement: (medicineCode: string) => void
    getQuantity: (medicineCode: string) => number
    toPayload: () => CartRequestDto[]
    clear: () => void
}
