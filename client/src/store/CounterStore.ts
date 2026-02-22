import { create as createStore } from 'zustand';
import type { CounterState } from '../shared/stores/CounterStoreTypes';

export const useCounterStore = createStore<CounterState>((setState) => ({
    count: 0,
    increment: () => setState((state) => ({ count: state.count + 1 })),
    decrement: () => setState((state) => ({ count: state.count - 1 })),
}))
