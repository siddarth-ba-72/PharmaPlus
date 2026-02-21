export interface BannerContainerState {
    isDropdownOpen: boolean
    redirectToHome: boolean
    redirectToProfile: boolean
}

export type AuthMode = 'login' | 'register'

export interface AuthContainerState {
    mode: AuthMode
    password: string
    submitting: boolean
    error: string | null
    redirectToHome: boolean
}

export interface ProfileContainerState {
    isEditing: boolean
    firstName: string
    lastName: string
    emailId: string
    age: string
    submitting: boolean
    localError: string | null
}
