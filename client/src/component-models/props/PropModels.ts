import type { LoginRequestDto } from "../../shared/dto/LoginRequestDto"
import type { RegisterRequestDto } from "../../shared/dto/RegisterRequestDto"

interface AbstractProps {
    loading: boolean
    error: string | null
}

export interface BannerComponentProps {
    isAuthenticated: boolean
    firstName: string | null
    isDropdownOpen: boolean
    onUserNameClick: () => void
    onLogoutClick: () => void
}

export interface BannerContainerProps {
    isAuthenticated: boolean
    firstName: string | null
    logoutUser: () => Promise<void>
}

export interface AuthContainerProps {
    username: string | null
    firstName: string | null
    lastName: string | null
    emailId: string | null
    age: number | null
    setAuthField: (
        field: 'username' | 'firstName' | 'lastName' | 'emailId' | 'age',
        value: string | number | null,
    ) => void
    fetchUserProfile: () => void
    loginUser: (request: LoginRequestDto) => Promise<void>
    registerUser: (request: RegisterRequestDto) => Promise<void>
}
