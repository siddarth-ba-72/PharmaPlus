import axios, { type AxiosRequestConfig } from 'axios'

export abstract class AbstractService {

    private readonly baseUrl = 'http://localhost:7236/'

    protected buildApiUrl(path: string): string {
        if (/^https?:\/\//i.test(path)) {
            return path
        }

        if (!this.baseUrl) {
            return path.startsWith('/') ? path : `/${path}`
        }

        const normalizedBaseUrl = this.baseUrl.replace(/\/+$/, '')
        const normalizedPath = path.startsWith('/') ? path : `/${path}`
        return `${normalizedBaseUrl}${normalizedPath}`
    }

    protected async get<TResponse>(
        endpoint: string,
        config?: AxiosRequestConfig
    ): Promise<TResponse> {
        const response = await axios.get<TResponse>(this.buildApiUrl(endpoint), {
            withCredentials: true,
            ...config,
        })
        return response.data
    }

    protected async post<TResponse, TRequest = unknown>(
        endpoint: string,
        body?: TRequest,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response = await axios.post<TResponse>(this.buildApiUrl(endpoint), body, {
            withCredentials: true,
            ...config,
        })
        return response.data
    }

    protected async put<TResponse, TRequest = unknown>(
        endpoint: string,
        body?: TRequest,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response = await axios.put<TResponse>(this.buildApiUrl(endpoint), body, {
            withCredentials: true,
            ...config,
        })
        return response.data
    }

    protected async patch<TResponse, TRequest = unknown>(
        endpoint: string,
        body?: TRequest,
        config?: AxiosRequestConfig,
    ): Promise<TResponse> {
        const response = await axios.patch<TResponse>(this.buildApiUrl(endpoint), body, {
            withCredentials: true,
            ...config,
        })
        return response.data
    }

    protected async delete<TResponse>(endpoint: string, config?: AxiosRequestConfig): Promise<TResponse> {
        const response = await axios.delete<TResponse>(this.buildApiUrl(endpoint), {
            withCredentials: true,
            ...config,
        })
        return response.data
    }
}
