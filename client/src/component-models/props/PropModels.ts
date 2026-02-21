import type { LoginRequestDto } from "../../shared/dto/LoginRequestDto"
import type { RegisterRequestDto } from "../../shared/dto/RegisterRequestDto"
import type { ChangeEvent, FormEvent } from "react"

interface AbstractProps {
    loading: boolean
    error: string | null
}

export interface BannerComponentProps {
    isAuthenticated: boolean
    firstName: string | null
    isDropdownOpen: boolean
    onUserNameClick: () => void
    onProfileClick: () => void
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

export interface ProfileComponentProps {
    username: string
    firstName: string
    lastName: string
    emailId: string
    age: string
    isEditing: boolean
    submitting: boolean
    error: string | null
    onEditClick: () => void
    onCancelEdit: () => void
    onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export interface ProfileContainerProps {
    username: string | null
    firstName: string | null
    lastName: string | null
    emailId: string | null
    age: number | null
    loading: boolean
    error: string | null
    fetchUserProfile: () => void
    updateUser: (payload: { firstName: string; lastName: string; emailId: string; age: number }) => Promise<void>
}
