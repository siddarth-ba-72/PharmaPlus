export type ResponseDataDto<T> = T & {
    message?: string
}

export interface ResponseDto<T> {
    success: boolean
    data: ResponseDataDto<T>
}
