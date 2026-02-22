import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthComponentView } from './AuthComponentView'
import { useAuthStore } from '../../store/AuthStore'
import { useLoginMutation, useRegisterMutation, useUserProfileQuery } from '../../shared/queries/AuthQueries'
import type { AuthMode } from '../../shared/states/StateModels'
import type { AuthComponentProps } from '../../shared/props/PropModels'

export const AuthComponent = () => {

    const navigate = useNavigate()
    const [mode, setMode] = useState<AuthMode>('login')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)
    const username = useAuthStore((state) => state.authForm.username)
    const firstName = useAuthStore((state) => state.authForm.firstName)
    const lastName = useAuthStore((state) => state.authForm.lastName)
    const emailId = useAuthStore((state) => state.authForm.emailId)
    const age = useAuthStore((state) => state.authForm.age)
    const setAuthField = useAuthStore((state) => state.setAuthField)
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

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
        setError(null)
    }

    const submitLogin = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const userName = username ?? ''

        setError(null)
        try {
            await loginMutation.mutateAsync({ userName, password })
            navigate('/pharma-plus/home', { replace: true })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed'
            setError(errorMessage)
        }
    }

    const submitRegister = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()
        const userName = username ?? ''
        const firstNameValue = firstName ?? ''
        const lastNameValue = lastName ?? ''
        const emailIdValue = emailId ?? ''
        const ageValue = age ?? 0

        setError(null)
        try {
            await registerMutation.mutateAsync({
                userName,
                firstName: firstNameValue,
                lastName: lastNameValue,
                emailId: emailIdValue,
                password,
                age: ageValue,
            })
            navigate('/pharma-plus/home', { replace: true })
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Registration failed'
            setError(errorMessage)
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
        error,
        onInputChange: handleInputChange,
        onToggleMode: toggleMode,
        onLoginSubmit: submitLogin,
        onRegisterSubmit: submitRegister,
    }

    return (
        <AuthComponentView {...authComponentProps} />
    )
}
