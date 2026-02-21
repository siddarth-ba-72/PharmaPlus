import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { initialCounterState } from '../redux-states/initial-states/InitialCounterState'
import { StateConstants } from '../redux-states/StateConstants'
import { CounterService } from '../../services/CounterService'
import type { RootState } from '../redux-store/ReduxStore'

const counterService = new CounterService()

export const fetchInitialCounter = createAsyncThunk(
    `${StateConstants.COUNTER_STATE}/fetchInitialCounter`,
    async () => {
        return await counterService.getInitialCounterValue()
    },
    {
        condition: (_, { getState }) => {
            const state = getState() as RootState
            const counter = state.counter

            if (counter.loading || counter.isInitialized) {
                return false
            }

            return true
        },
    },
)

const counterStateManager = createSlice({
    name: StateConstants.COUNTER_STATE,
    initialState: initialCounterState,
    reducers: {
        increment(state) {
            state.value += 1
        },
        decrement(state) {
            state.value -= 1
        },
        incrementByAmount(state, action: PayloadAction<number>) {
            state.value += action.payload
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInitialCounter.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchInitialCounter.fulfilled, (state, action) => {
                state.loading = false
                state.value = action.payload
                state.isInitialized = true
            })
            .addCase(fetchInitialCounter.rejected, (state) => {
                state.loading = false
                state.error = 'Failed to load initial counter value.'
            })
    },
})

export const { increment, decrement, incrementByAmount } = counterStateManager.actions
export default counterStateManager.reducer
