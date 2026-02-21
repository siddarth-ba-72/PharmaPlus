import type { CounterDto } from '../shared/dto/CounterDto'
import type { ResponseDto } from '../shared/dto/ResponseDto'
import { ApiEndpoints } from '../shared/ApiEndpoints'
import { AbstractService } from './AbstractService'

export class CounterService extends AbstractService {
    async getInitialCounterValue(): Promise<number> {
        const response = await this.get<ResponseDto<CounterDto>>(ApiEndpoints.COUNTER)

        if (!response.success) {
            throw new Error(response.data.message ?? 'Counter API returned unsuccessful response.')
        }

        return response.data.value
    }
}
