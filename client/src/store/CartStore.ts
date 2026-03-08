import { create } from 'zustand'
import type { CartStoreState } from '../shared/storetypes/CartStoreTypes'

export const useCartStore = create<CartStoreState>((setState, getState) => ({
    items: {},
    setFromItems: (items) =>
        setState({
            items: items.reduce<Record<string, number>>((accumulator, item) => {
                if (!item.medicineCode) {
                    return accumulator
                }
                accumulator[item.medicineCode] = item.quantity
                return accumulator
            }, {}),
        }),
    increment: (medicineCode: string) =>
        setState((state) => ({
            items: {
                ...state.items,
                [medicineCode]: (state.items[medicineCode] ?? 0) + 1,
            },
        })),
    decrement: (medicineCode: string) =>
        setState((state) => {
            const currentQuantity = state.items[medicineCode] ?? 0
            const nextQuantity = Math.max(0, currentQuantity - 1)
            if (nextQuantity === 0) {
                const { [medicineCode]: _, ...rest } = state.items
                return { items: rest }
            }

            return {
                items: {
                    ...state.items,
                    [medicineCode]: nextQuantity,
                },
            }
        }),
    getQuantity: (medicineCode: string) => getState().items[medicineCode] ?? 0,
    toPayload: () =>
        Object.entries(getState().items)
            .filter(([, quantity]) => quantity > 0)
            .map(([medicineCode, quantity]) => ({ medicineCode, quantity })),
    clear: () => setState({ items: {} }),
}))
