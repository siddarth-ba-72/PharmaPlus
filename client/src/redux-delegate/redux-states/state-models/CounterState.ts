import type { AbstractState } from "../AbstractState";

export interface CounterState extends AbstractState {
    value: number
}
