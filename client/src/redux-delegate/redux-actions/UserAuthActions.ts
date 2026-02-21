import { createAsyncThunk } from '@reduxjs/toolkit'
import type { RootState } from '../redux-store/ReduxStore'
import { AuthService } from '../../services/AuthService'
import type { AuthDto } from '../../shared/dto/AuthDto'
import type { LoginRequestDto } from '../../shared/dto/LoginRequestDto'
import type { RegisterRequestDto } from '../../shared/dto/RegisterRequestDto'
import type { ResponseDataDto } from '../../shared/dto/ResponseDto'
import { StateConstants } from '../redux-states/StateConstants'

const authService = new AuthService()

export const fetchUserProfileAction = createAsyncThunk<ResponseDataDto<AuthDto>, boolean | undefined, { state: RootState }>(
    `${StateConstants.USER_AUTH_STATE}/fetchUserProfile`,
    async () => {
        return await authService.getUserProfile()
    },
    {
        condition: (forceFetch, { getState }) => {
            if (forceFetch) {
                return true
            }

            const state = getState()
            const userAuth = state.userAuth
            return !(userAuth.loading || userAuth.isInitialized)
        },
    },
)

export const loginUserAction = createAsyncThunk<ResponseDataDto<AuthDto>, LoginRequestDto>(
    `${StateConstants.USER_AUTH_STATE}/loginUser`,
    async (loginRequest) => {
        return await authService.loginUser(loginRequest)
    },
)

export const registerUserAction = createAsyncThunk<ResponseDataDto<AuthDto>, RegisterRequestDto>(
    `${StateConstants.USER_AUTH_STATE}/registerUser`,
    async (registerRequest) => {
        return await authService.registerUser(registerRequest)
    },
)

export const logoutUserAction = createAsyncThunk<void, void>(
    `${StateConstants.USER_AUTH_STATE}/logoutUser`,
    async () => {
        await authService.logoutUser()
    },
)
