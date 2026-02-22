import type { ChangeEvent, FormEvent } from 'react'
import type { LoginRequestDto } from '../dto/LoginRequestDto'
import type { RegisterRequestDto } from '../dto/RegisterRequestDto'
import type { AuthMode } from '../states/StateModels'
import type { AuthField, UpdateUserPayload } from '../stores/AuthStoreTypes'

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
    setAuthField: (field: AuthField, value: string | number | null) => void
    fetchUserProfile: () => void
    loginUser: (request: LoginRequestDto) => Promise<void>
    registerUser: (request: RegisterRequestDto) => Promise<void>
}

export interface AuthComponentProps {
    mode: AuthMode
    userName: string
    password: string
    firstName: string
    lastName: string
    emailId: string
    age: string
    submitting: boolean
    error: string | null
    onInputChange: (event: ChangeEvent<HTMLInputElement>) => void
    onToggleMode: () => void
    onLoginSubmit: (event: FormEvent<HTMLFormElement>) => void
    onRegisterSubmit: (event: FormEvent<HTMLFormElement>) => void
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

export interface ProfileContainerProps extends AbstractProps {
    username: string | null
    firstName: string | null
    lastName: string | null
    emailId: string | null
    age: number | null
    fetchUserProfile: () => void
    updateUser: (payload: UpdateUserPayload) => Promise<void>
}

export interface CounterComponentProps {
    count: number
    onIncrement: () => void
    onDecrement: () => void
}
