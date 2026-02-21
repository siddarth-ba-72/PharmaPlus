import axios, { type AxiosRequestConfig } from 'axios'

export abstract class AbstractService {

    private readonly baseUrl = 'http://localhost:3000/'

    protected buildApiUrl(path: string): string {
        if (!this.baseUrl) {
            return path
        }

        return `${this.baseUrl.replace(/\/$/, '')}${path}`
    }

    protected async get<TResponse>(
        endpoint: string,
        config?: AxiosRequestConfig
    ): Promise<TResponse> {
        const response = await axios.get<TResponse>(this.buildApiUrl(endpoint), config)
        return response.data
    }

    protected async post<TResponse, TRequest = unknown>(
        endpoint: string,
        body?: TRequest,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response = await axios.post<TResponse>(this.buildApiUrl(endpoint), body, config)
        return response.data
    }

    protected async put<TResponse, TRequest = unknown>(
        endpoint: string,
        body?: TRequest,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response = await axios.put<TResponse>(this.buildApiUrl(endpoint), body, config)
        return response.data
    }

    protected async patch<TResponse, TRequest = unknown>(
        endpoint: string,
        body?: TRequest,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response = await axios.patch<TResponse>(this.buildApiUrl(endpoint), body, config)
        return response.data
    }

    protected async delete<TResponse>(endpoint: string, config?: AxiosRequestConfig): Promise<TResponse> {
        const response = await axios.delete<TResponse>(this.buildApiUrl(endpoint), config)
        return response.data
    }
}