import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthComponentView } from './AuthComponentView'
import { useAuthStore } from '../../store/AuthStore'
import { useLoginMutation, useRegisterMutation, useUserProfileQuery } from '../../shared/queries/AuthQueries'
import type { AuthMode } from '../../shared/states/StateModels'
import type { AuthComponentProps } from '../../shared/props/PropModels'
import { useToastStore } from '../../store/ToastStore'

export const AuthComponent = () => {

    const navigate = useNavigate()
    const [mode, setMode] = useState<AuthMode>('login')
    const [password, setPassword] = useState('')
    const username = useAuthStore((state) => state.authForm.username)
    const firstName = useAuthStore((state) => state.authForm.firstName)
    const lastName = useAuthStore((state) => state.authForm.lastName)
    const emailId = useAuthStore((state) => state.authForm.emailId)
    const age = useAuthStore((state) => state.authForm.age)
    const setAuthField = useAuthStore((state) => state.setAuthField)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
    const showToast = useToastStore((state) => state.showToast)

    useUserProfileQuery()
    const loginMutation = useLoginMutation()
    const registerMutation = useRegisterMutation()
    const submitting = loginMutation.isPending || registerMutation.isPending

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target

        switch (name) {
            case 'userName':
                setAuthField('username', value)
                break
            case 'password':
                setPassword(value)
                break
            case 'firstName':
                setAuthField('firstName', value)
                break
            case 'lastName':
                setAuthField('lastName', value)
                break
            case 'emailId':
                setAuthField('emailId', value)
                break
            case 'age':
                setAuthField('age', value === '' ? null : Number(value))
                break
            default:
                break
        }
    }

    const toggleMode = (): void => {
        setMode((currentMode) => (currentMode === 'login' ? 'register' : 'login'))
    }

    const submitLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const userName = username ?? ''

        try {
            const response = await loginMutation.mutateAsync({ userName, password })
            showToast({
                category: 'success',
                message: response.message ?? `Welcome back, ${userName}!`,
            })
            navigate('/pharma-plus/home', { replace: true })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed'
            showToast({
                category: 'fail',
                message: errorMessage,
            })
        }
    }

    const submitRegister = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const userName = username ?? ''
        const firstNameValue = firstName ?? ''
        const lastNameValue = lastName ?? ''
        const emailIdValue = emailId ?? ''
        const ageValue = age ?? 0

        try {
            const response = await registerMutation.mutateAsync({
                userName,
                firstName: firstNameValue,
                lastName: lastNameValue,
                emailId: emailIdValue,
                password,
                age: ageValue,
            })
            showToast({
                category: 'success',
                message: response.message ?? `Registration successful for ${userName}.`,
            })
            navigate('/pharma-plus/home', { replace: true })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed'
            showToast({
                category: 'fail',
                message: errorMessage,
            })
        }
    }

    if (isAuthenticated) {
        return <Navigate to="/pharma-plus/home" replace />
    }

    const authComponentProps: AuthComponentProps = {
        mode,
        userName: username ?? '',
        password,
        firstName: firstName ?? '',
        lastName: lastName ?? '',
        emailId: emailId ?? '',
        age: age === null ? '' : age.toString(),
        submitting,
        onInputChange: handleInputChange,
        onToggleMode: toggleMode,
        onLoginSubmit: submitLogin,
        onRegisterSubmit: submitRegister,
    }

    return (
        <AuthComponentView {...authComponentProps} />
    )
}
