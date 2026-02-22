import axios from 'axios'
import { ApiEndpoints } from "../shared/api/ApiEndpoints";
import type { AuthDto } from "../shared/dto/AuthDto";
import type { LoginRequestDto } from "../shared/dto/LoginRequestDto";
import type { RegisterRequestDto } from "../shared/dto/RegisterRequestDto";
import type { ResponseDataDto, ResponseDto } from "../shared/dto/ResponseDto";
import type { UpdateUserRequestDto } from "../shared/dto/UpdateUserRequestDto";
import { AbstractService } from "./AbstractService";

export class AuthService extends AbstractService {
    private getBackendErrorMessage(error: unknown, fallbackMessage: string): string {
        if (axios.isAxiosError(error)) {
            const responseData = error.response?.data as
                | {
                    message?: string
                    error?: string | { message?: string }
                    data?: { message?: string }
                }
                | undefined

            if (typeof responseData?.error === 'object' && responseData.error?.message) {
                return responseData.error.message
            }

            if (typeof responseData?.error === 'string') {
                return responseData.error
            }

            if (responseData?.data?.message) {
                return responseData.data.message
            }

            if (responseData?.message) {
                return responseData.message
            }
        }

        if (error instanceof Error) {
            return error.message
        }

        return fallbackMessage
    }

    async getUserProfile(): Promise<ResponseDataDto<AuthDto>> {
        try {
            const response = await this.get<ResponseDto<AuthDto>>(ApiEndpoints.CURRENT_USER)

            if (!response.success) {
                throw new Error(response.data.message ?? 'Could not fetch user profile!')
            }

            return response.data
        } catch (error) {
            throw new Error(this.getBackendErrorMessage(error, 'Could not fetch user profile!'))
        }
    }

    async loginUser(loginRequest: LoginRequestDto): Promise<ResponseDataDto<AuthDto>> {
        try {
            const response = await this.post<ResponseDto<AuthDto>, LoginRequestDto>(ApiEndpoints.LOGIN, loginRequest)

            if (!response.success) {
                throw new Error(response.data.message ?? 'Login failed')
            }

            return response.data
        } catch (error) {
            throw new Error(this.getBackendErrorMessage(error, 'Login failed'))
        }
    }

    async registerUser(registerRequest: RegisterRequestDto): Promise<ResponseDataDto<AuthDto>> {
        try {
            const response = await this.post<ResponseDto<AuthDto>, RegisterRequestDto>(ApiEndpoints.REGISTER, registerRequest)

            if (!response.success) {
                throw new Error(response.data.message ?? 'Registration failed')
            }

            return response.data
        } catch (error) {
            throw new Error(this.getBackendErrorMessage(error, 'Registration failed'))
        }
    }

    async logoutUser(): Promise<void> {
        try {
            const response = await this.get<ResponseDto<Record<string, never>>>(ApiEndpoints.LOGOUT)

            if (!response.success) {
                throw new Error(response.data.message ?? 'Logout failed')
            }
        } catch (error) {
            throw new Error(this.getBackendErrorMessage(error, 'Logout failed'))
        }
    }

    async updateUser(updateData: Partial<UpdateUserRequestDto>): Promise<ResponseDataDto<AuthDto>> {
        try {
            const response = await this.put<ResponseDto<AuthDto>, Partial<UpdateUserRequestDto>>(ApiEndpoints.UPDATE_USER, updateData)

            if (!response.success) {
                throw new Error(response.data.message ?? 'Update user failed')
            }

            return response.data
        } catch (error) {
            throw new Error(this.getBackendErrorMessage(error, 'Update user failed'))
        }
    }

}
