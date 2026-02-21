import { configureStore } from '@reduxjs/toolkit'
import counterStateManager from '../redux-state-managers/CounterStateManager'
import UserAuthStateManager from '../redux-state-managers/UserAuthStateManager'

export const ReduxStore = configureStore({
    reducer: {
        counter: counterStateManager,
        userAuth: UserAuthStateManager,
    },
})

export type RootState = ReturnType<typeof ReduxStore.getState>
export type AppDispatch = typeof ReduxStore.dispatch
