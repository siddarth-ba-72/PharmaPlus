import { create } from 'zustand'
import type { ToastState } from '../shared/storetypes/ToastStoreTypes'

export const useToastStore = create<ToastState>((setState) => ({
    isVisible: false,
    category: 'success',
    message: '',
    actionLabel: undefined,
    onAction: undefined,
    toastId: 0,
    showToast: ({ category, message, actionLabel, onAction }) =>
        setState((currentState) => ({
            isVisible: true,
            category,
            message,
            actionLabel,
            onAction,
            toastId: currentState.toastId + 1,
        })),
    hideToast: () =>
        setState({
            isVisible: false,
            message: '',
            actionLabel: undefined,
            onAction: undefined,
        }),
}))
