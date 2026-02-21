import { configureStore } from '@reduxjs/toolkit'
// import counterReducer from '../redux-reducers/counterSlice'
import counterStateManager from '../redux-state-managers/CounterStateManager'

export const ReduxStore = configureStore({
    reducer: {
        counter: counterStateManager,
    },
})

export type RootState = ReturnType<typeof ReduxStore.getState>
export type AppDispatch = typeof ReduxStore.dispatch
