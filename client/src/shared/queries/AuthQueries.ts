import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { LoginRequestDto } from '../dto/LoginRequestDto'
import type { RegisterRequestDto } from '../dto/RegisterRequestDto'
import { AuthService } from '../../services/AuthService'
import { useAuthStore } from '../../store/AuthStore'
import type { ResponseDataDto } from '../dto/ResponseDto'
import type { AuthDto } from '../dto/AuthDto'
import type { UpdateUserPayload } from '../storetypes/AuthStoreTypes'
import { mapAuthDtoToAuthUser } from '../storetypes/AuthStoreTypes'

const authService = new AuthService()

export const authQueryKeys = {
    currentUser: ['auth', 'currentUser'] as const,
}

export const useUserProfileQuery = () => {
    const setUser = useAuthStore((state) => state.setUser)
    const clearSession = useAuthStore((state) => state.clearSession)

    const userProfileQuery = useQuery({
        queryKey: authQueryKeys.currentUser,
        queryFn: async () => authService.getUserProfile(),
        retry: false,
    })

    useEffect(() => {
        if (userProfileQuery.data) {
            setUser(mapAuthDtoToAuthUser(userProfileQuery.data))
            return
        }

        if (userProfileQuery.error) {
            clearSession()
        }
    }, [clearSession, setUser, userProfileQuery.data, userProfileQuery.error])

    return userProfileQuery
}

export const useLoginMutation = () => {
    const queryClient = useQueryClient()
    const setUser = useAuthStore((state) => state.setUser)

    return useMutation({
        mutationFn: async (loginRequest: LoginRequestDto) => authService.loginUser(loginRequest),
        onSuccess: (authData: ResponseDataDto<AuthDto>) => {
            setUser(mapAuthDtoToAuthUser(authData))
            queryClient.setQueryData(authQueryKeys.currentUser, authData)
        },
    })
}

export const useRegisterMutation = () => {
    const queryClient = useQueryClient()
    const setUser = useAuthStore((state) => state.setUser)

    return useMutation({
        mutationFn: async (registerRequest: RegisterRequestDto) => authService.registerUser(registerRequest),
        onSuccess: (authData: ResponseDataDto<AuthDto>) => {
            setUser(mapAuthDtoToAuthUser(authData))
            queryClient.setQueryData(authQueryKeys.currentUser, authData)
        },
    })
}

export const useLogoutMutation = () => {
    const queryClient = useQueryClient()
    const clearSession = useAuthStore((state) => state.clearSession)

    return useMutation({
        mutationFn: async () => authService.logoutUser(),
        onSuccess: () => {
            clearSession()
            queryClient.removeQueries({ queryKey: authQueryKeys.currentUser })
        },
    })
}

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient()
    const setUser = useAuthStore((state) => state.setUser)

    return useMutation({
        mutationFn: async (payload: UpdateUserPayload) => authService.updateUser(payload),
        onSuccess: (authData: ResponseDataDto<AuthDto>) => {
            const mappedUser = mapAuthDtoToAuthUser(authData)
            setUser(mappedUser)
            queryClient.setQueryData(authQueryKeys.currentUser, authData)
            if (!mappedUser) {
                queryClient.invalidateQueries({ queryKey: authQueryKeys.currentUser })
            }
        },
    })
}
