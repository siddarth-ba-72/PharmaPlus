import { useMutation, useQuery } from '@tanstack/react-query'
import { AdminService } from '../../services/AdminService'
import type { ModifyStockRequestDto, SaveMedicineRequestDto } from '../dto/AdminApiDto'

const adminService = new AdminService()

export const adminQueryKeys = {
    allUsers: ['admin', 'allUsers'] as const,
}

export const useAllUsersQuery = () =>
    useQuery({
        queryKey: adminQueryKeys.allUsers,
        queryFn: async () => adminService.getAllUsers(),
        retry: false,
    })

export const useAddMedicineMutation = () =>
    useMutation({
        mutationFn: async (payload: SaveMedicineRequestDto) => adminService.addMedicine(payload),
    })

export const useUpdateMedicineStockMutation = () =>
    useMutation({
        mutationFn: async (payload: ModifyStockRequestDto) => adminService.updateMedicineStock(payload),
    })
