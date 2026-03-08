import { ApiEndpoints } from '../shared/api/ApiEndpoints'
import type { AllUsersResponseDto, ModifyStockRequestDto, SaveMedicineRequestDto } from '../shared/dto/AdminApiDto'
import type { ResponseDto } from '../shared/dto/ResponseDto'
import type { UserDto } from '../shared/dto/UserDto'
import { AbstractService } from './AbstractService'

export class AdminService extends AbstractService {
    async getAllUsers(): Promise<UserDto[]> {
        const response = await this.get<ResponseDto<AllUsersResponseDto>>(ApiEndpoints.ALL_USERS)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not fetch users.')
        }

        return response.data.users ?? []
    }

    async addMedicine(payload: SaveMedicineRequestDto): Promise<string> {
        const response = await this.post<ResponseDto<Record<string, never>>, SaveMedicineRequestDto>(
            ApiEndpoints.SAVE_MEDICINE,
            payload,
        )

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not add medicine.')
        }

        return response.data.message ?? 'Medicine added successfully.'
    }

    async updateMedicineStock(payload: ModifyStockRequestDto): Promise<string> {
        const response = await this.post<ResponseDto<Record<string, never>>, ModifyStockRequestDto>(
            ApiEndpoints.MODIFY_STOCK,
            payload,
        )

        if (!response.success) {
            throw new Error(response.data.message ?? 'Could not update medicine stock.')
        }

        return response.data.message ?? 'Medicine stock updated successfully.'
    }
}
