export type ToastCategory = 'success' | 'warn' | 'fail'

export interface ToastPayload {
    category: ToastCategory
    message: string
    actionLabel?: string
    onAction?: () => void
}

export interface ToastState extends ToastPayload {
    isVisible: boolean
    toastId: number
    showToast: (payload: ToastPayload) => void
    hideToast: () => void
}
