import type { CounterState } from '../state-models/CounterState'

export const initialCounterState: CounterState = {
    value: 0,
    loading: false,
    error: null,
    isInitialized: false,
}
