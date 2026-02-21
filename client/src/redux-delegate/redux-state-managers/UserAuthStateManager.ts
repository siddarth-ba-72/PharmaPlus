import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { StateConstants } from '../redux-states/StateConstants'
import { initialUserAuthState } from '../redux-states/initial-states/InitialUserAuthState'
import { fetchUserProfileAction, loginUserAction, logoutUserAction, registerUserAction } from '../redux-actions/UserAuthActions'

const userAuthStateManager = createSlice({
    name: StateConstants.USER_AUTH_STATE,
    initialState: initialUserAuthState,
    reducers: {
        setUserAuthField(
            state,
            action: PayloadAction<{
                field: 'username' | 'firstName' | 'lastName' | 'emailId' | 'age'
                value: string | number | null
            }>,
        ) {
            const { field, value } = action.payload
            ;(state as Record<string, string | number | boolean | null>)[field] = value
        },
        clearUserAuthError(state) {
            state.error = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserProfileAction.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(fetchUserProfileAction.fulfilled, (state, action) => {
                state.loading = false
                state.isInitialized = true

                if (action.payload.user) {
                    state.isAuthenticated = true
                    state.username = action.payload.user.username
                    state.firstName = action.payload.user.firstName
                    state.lastName = action.payload.user.lastName
                    state.emailId = action.payload.user.emailId
                    state.age = action.payload.user.age
                    return
                }

                state.isAuthenticated = false
                state.username = null
                state.firstName = null
                state.lastName = null
                state.emailId = null
                state.age = null
            })
            .addCase(fetchUserProfileAction.rejected, (state, action) => {
                state.loading = false
                state.isAuthenticated = false
                state.username = null
                state.firstName = null
                state.lastName = null
                state.emailId = null
                state.age = null
                state.error = action.error.message ?? 'Failed to load user profile.'
                state.isInitialized = true
            })
            .addCase(loginUserAction.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(loginUserAction.fulfilled, (state, action) => {
                state.loading = false
                state.isInitialized = true

                if (action.payload.user) {
                    state.isAuthenticated = true
                    state.username = action.payload.user.username
                    state.firstName = action.payload.user.firstName
                    state.lastName = action.payload.user.lastName
                    state.emailId = action.payload.user.emailId
                    state.age = action.payload.user.age
                    return
                }

                state.isAuthenticated = false
            })
            .addCase(loginUserAction.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ?? 'Login failed.'
            })
            .addCase(registerUserAction.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(registerUserAction.fulfilled, (state, action) => {
                state.loading = false
                state.isInitialized = true

                if (action.payload.user) {
                    state.isAuthenticated = true
                    state.username = action.payload.user.username
                    state.firstName = action.payload.user.firstName
                    state.lastName = action.payload.user.lastName
                    state.emailId = action.payload.user.emailId
                    state.age = action.payload.user.age
                    return
                }

                state.isAuthenticated = false
            })
            .addCase(registerUserAction.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message ?? 'Registration failed.'
            })
            .addCase(logoutUserAction.fulfilled, (state) => {
                state.isAuthenticated = false
                state.username = null
                state.firstName = null
                state.lastName = null
                state.emailId = null
                state.age = null
                state.loading = false
                state.error = null
                state.isInitialized = false
            })
    },
})

export const { setUserAuthField, clearUserAuthError } = userAuthStateManager.actions
export default userAuthStateManager.reducer
