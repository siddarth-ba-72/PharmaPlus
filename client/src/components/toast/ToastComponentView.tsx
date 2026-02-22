import type { ToastCategory } from '../../shared/stores/ToastStoreTypes'

type ToastComponentViewProps = {
    category: ToastCategory
    message: string
    onClose: () => void
}

export const ToastComponentView = ({ category, message, onClose }: ToastComponentViewProps) => {
    return (
        <div className={`toast toast-${category}`} role="status" aria-live="polite">
            <p className="toast-message">{message}</p>
            <button type="button" className="toast-close-btn" onClick={onClose}>
                Cancel
            </button>
        </div>
    )
}
