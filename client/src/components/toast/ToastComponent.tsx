import { useEffect } from 'react'
import { useToastStore } from '../../store/ToastStore'
import { ToastComponentView } from './ToastComponentView'

export const ToastComponent = () => {
    const isVisible = useToastStore((state) => state.isVisible)
    const category = useToastStore((state) => state.category)
    const message = useToastStore((state) => state.message)
    const toastId = useToastStore((state) => state.toastId)
    const hideToast = useToastStore((state) => state.hideToast)

    useEffect(() => {
        if (!isVisible) {
            return
        }

        const timeoutId = window.setTimeout(() => {
            hideToast()
        }, 5000)

        return () => {
            window.clearTimeout(timeoutId)
        }
    }, [hideToast, isVisible, toastId])

    if (!isVisible || !message) {
        return null
    }

    return <ToastComponentView category={category} message={message} onClose={hideToast} />
}
