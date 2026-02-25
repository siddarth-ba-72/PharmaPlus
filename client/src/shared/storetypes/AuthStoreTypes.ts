import type { AuthDto } from '../dto/AuthDto'

export interface AuthUser {
    username: string
    firstName: string
    lastName: string
    emailId: string
    age: number
    isAdmin: boolean
}

export interface AuthFormState {
    username: string | null
    firstName: string | null
    lastName: string | null
    emailId: string | null
    age: number | null
}

export type AuthField = keyof AuthFormState

export interface UpdateUserPayload {
    firstName: string
    lastName: string
    emailId: string
    age: number
}

export interface AuthStoreState {
    isInitialized: boolean
    isAuthenticated: boolean
    user: AuthUser | null
    authForm: AuthFormState
    setAuthField: (field: AuthField, value: string | number | null) => void
    hydrateAuthFormFromUser: () => void
    resetAuthForm: () => void
    setUser: (user: AuthUser | null) => void
    clearSession: () => void
}

export const mapAuthDtoToAuthUser = (authData: AuthDto): AuthUser | null => {
    if (!authData.user) {
        return null
    }

    return {
        username: authData.user.username,
        firstName: authData.user.firstName,
        lastName: authData.user.lastName,
        emailId: authData.user.emailId,
        age: authData.user.age,
        isAdmin: authData.user.isAdmin,
    }
}
