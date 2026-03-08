import type { ToastCategory } from '../../shared/storetypes/ToastStoreTypes'

type ToastComponentViewProps = {
    category: ToastCategory
    message: string
    onClose: () => void
}

export const ToastComponentView = ({ category, message, onClose }: ToastComponentViewProps) => {
    const themeClasses = {
        success: 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-100',
        warn: 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-100',
        fail: 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/70 dark:text-rose-100',
    }[category]

    return (
        <div
            className={`fixed left-1/2 top-4 z-[60] flex w-[92vw] max-w-xl -translate-x-1/2 items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${themeClasses}`}
            role="status"
            aria-live="polite"
        >
            <p className="m-0 flex-1 text-sm font-semibold">{message}</p>
            <button
                type="button"
                className="rounded-lg border border-current px-3 py-1 text-xs font-bold opacity-90 transition hover:opacity-100"
                onClick={onClose}
            >
                Cancel
            </button>
        </div>
    )
}
