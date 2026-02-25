import { create } from 'zustand'
import type { AuthField, AuthFormState, AuthStoreState, AuthUser } from '../shared/storetypes/AuthStoreTypes'

const initialAuthFormState: AuthFormState = {
    username: null,
    firstName: null,
    lastName: null,
    emailId: null,
    age: null,
}

const toAuthFormState = (user: AuthUser | null): AuthFormState => {
    if (!user) {
        return initialAuthFormState
    }

    return {
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        emailId: user.emailId,
        age: user.age,
    }
}

export const useAuthStore = create<AuthStoreState>((setState, getState) => ({
    isInitialized: false,
    isAuthenticated: false,
    user: null,
    authForm: initialAuthFormState,
    setAuthField: (field: AuthField, value: string | number | null) => {
        setState((currentState) => ({
            authForm: {
                ...currentState.authForm,
                [field]: value,
            },
        }))
    },
    hydrateAuthFormFromUser: () => {
        const user = getState().user
        setState({ authForm: toAuthFormState(user) })
    },
    resetAuthForm: () => {
        setState({ authForm: initialAuthFormState })
    },
    setUser: (user: AuthUser | null) => {
        setState({
            user,
            isAuthenticated: Boolean(user),
            isInitialized: true,
            authForm: toAuthFormState(user),
        })
    },
    clearSession: () => {
        setState({
            isInitialized: true,
            isAuthenticated: false,
            user: null,
            authForm: initialAuthFormState,
        })
    },
}))
