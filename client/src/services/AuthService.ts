import { ApiEndpoints } from "../shared/ApiEndpoints";
import type { AuthDto } from "../shared/dto/AuthDto";
import type { LoginRequestDto } from "../shared/dto/LoginRequestDto";
import type { RegisterRequestDto } from "../shared/dto/RegisterRequestDto";
import type { ResponseDataDto, ResponseDto } from "../shared/dto/ResponseDto";
import type { UpdateUserRequestDto } from "../shared/dto/UpdateUserRequestDto";
import { AbstractService } from "./AbstractService";

export class AuthService extends AbstractService {

    async getUserProfile(): Promise<ResponseDataDto<AuthDto>> {
        const response = await this.get<ResponseDto<AuthDto>>(ApiEndpoints.CURRENT_USER)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not fetch user profile!')
        }

        return response.data
    }

    async loginUser(loginRequest: LoginRequestDto): Promise<ResponseDataDto<AuthDto>> {
        const response = await this.post<ResponseDto<AuthDto>, LoginRequestDto>(ApiEndpoints.LOGIN, loginRequest)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Login failed')
        }

        return response.data
    }

    async registerUser(registerRequest: RegisterRequestDto): Promise<ResponseDataDto<AuthDto>> {
        const response = await this.post<ResponseDto<AuthDto>, RegisterRequestDto>(ApiEndpoints.REGISTER, registerRequest)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Registration failed')
        }

        return response.data
    }

    async logoutUser(): Promise<void> {
        const response = await this.get<ResponseDto<Record<string, never>>>(ApiEndpoints.LOGOUT)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Logout failed')
        }
    }

    async updateUser(updateData: Partial<UpdateUserRequestDto>): Promise<ResponseDataDto<AuthDto>> {
        const response = await this.put<ResponseDto<AuthDto>, Partial<UpdateUserRequestDto>>(ApiEndpoints.UPDATE_USER, updateData)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Update user failed')
        }

        return response.data
    }

}
