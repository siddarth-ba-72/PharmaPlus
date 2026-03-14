import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { ProfileComponentView } from './ProfileComponentView'
import { useAuthStore } from '../../store/AuthStore'
import { useUpdateUserMutation, useUserProfileQuery } from '../../shared/queries/AuthQueries'
import { useUserOrdersQuery } from '../../shared/queries/OrderQueries'
import type { ProfileComponentProps } from '../../shared/props/PropModels';

export const ProfileComponent = () => {

    const [isEditing, setIsEditing] = useState(false)
    const [localFirstName, setLocalFirstName] = useState('')
    const [localLastName, setLocalLastName] = useState('')
    const [localEmailId, setLocalEmailId] = useState('')
    const [localAge, setLocalAge] = useState('')
    const [localError, setLocalError] = useState<string | null>(null)
    const user = useAuthStore((state) => state.user)
    const userProfileQuery = useUserProfileQuery()
    const userOrdersQuery = useUserOrdersQuery()
    const updateUserMutation = useUpdateUserMutation()
    const submitting = updateUserMutation.isPending

    useEffect(() => {
        if (!isEditing) {
            return
        }

        setLocalFirstName(user?.firstName ?? '')
        setLocalLastName(user?.lastName ?? '')
        setLocalEmailId(user?.emailId ?? '')
        setLocalAge(user ? user.age.toString() : '')
    }, [isEditing, user])

    const enterEditMode = (): void => {
        setLocalFirstName(user?.firstName ?? '')
        setLocalLastName(user?.lastName ?? '')
        setLocalEmailId(user?.emailId ?? '')
        setLocalAge(user ? user.age.toString() : '')
        setLocalError(null)
        setIsEditing(true)
    }

    const cancelEditMode = (): void => {
        setIsEditing(false)
        setLocalError(null)
    }

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = event.target

        switch (name) {
            case 'firstName':
                setLocalFirstName(value)
                break
            case 'lastName':
                setLocalLastName(value)
                break
            case 'age':
                setLocalAge(value)
                break
            case 'emailId':
                setLocalEmailId(value)
                break
            default:
                break
        }
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()

        const emailId = localEmailId
        if (!emailId) {
            setLocalError('Email is missing for update operation.')
            return
        }

        setLocalError(null)
        try {
            await updateUserMutation.mutateAsync({
                firstName: localFirstName,
                lastName: localLastName,
                emailId,
                age: Number(localAge),
            })
            setIsEditing(false)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Update failed'
            setLocalError(errorMessage)
        }
    }

    const username = user?.username ?? ''
    const firstName = isEditing ? localFirstName : (user?.firstName ?? '')
    const lastName = isEditing ? localLastName : (user?.lastName ?? '')
    const emailId = isEditing ? localEmailId : (user?.emailId ?? '')
    const age = isEditing ? localAge : (user ? user.age.toString() : '')
    const error = localError ?? (userProfileQuery.error instanceof Error ? userProfileQuery.error.message : null)

    const profileComponentProps: ProfileComponentProps = {
        username,
        firstName,
        lastName,
        emailId,
        age,
        isEditing,
        submitting,
        error,
        orders: userOrdersQuery.data ?? [],
        ordersLoading: userOrdersQuery.isLoading,
        ordersError: userOrdersQuery.error instanceof Error ? userOrdersQuery.error.message : null,
        onEditClick: enterEditMode,
        onCancelEdit: cancelEditMode,
        onInputChange: handleInputChange,
        onSubmit: handleSubmit,
    }

    return (
        <ProfileComponentView {...profileComponentProps} />
    )
};
