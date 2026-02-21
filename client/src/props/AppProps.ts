import type { AbstractProps } from "./AbstractProps"

export interface AppProps extends AbstractProps {
    count: number
    fetchInitialCounter: () => void
    increment: () => void
    decrement: () => void
    incrementByFive: () => void
}
