import { create } from 'zustand'
import type { ToastState } from '../shared/storetypes/ToastStoreTypes'

export const useToastStore = create<ToastState>((setState) => ({
    isVisible: false,
    category: 'success',
    message: '',
    toastId: 0,
    showToast: ({ category, message }) =>
        setState((currentState) => ({
            isVisible: true,
            category,
            message,
            toastId: currentState.toastId + 1,
        })),
    hideToast: () =>
        setState({
            isVisible: false,
            message: '',
        }),
}))
