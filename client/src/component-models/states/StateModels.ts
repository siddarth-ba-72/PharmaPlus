export interface BannerContainerState {
    isDropdownOpen: boolean
    redirectToHome: boolean
}

export type AuthMode = 'login' | 'register'

export interface AuthContainerState {
    mode: AuthMode
    password: string
    submitting: boolean
    error: string | null
    redirectToHome: boolean
}
