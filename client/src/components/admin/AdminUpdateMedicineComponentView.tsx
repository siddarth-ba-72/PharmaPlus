import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

type AdminUpdateMedicineComponentViewProps = {
    medicineCode: string
    price: string
    quantity: string
    medicineSuggestions: Array<{ code: string; name: string }>
    showSuggestions: boolean
    medicinesLoading: boolean
    medicinesError: string | null
    submitting: boolean
    onMedicineCodeChange: (value: string) => void
    onMedicineCodeFocus: () => void
    onMedicineCodeBlur: () => void
    onSuggestionSelect: (value: string) => void
    onPriceChange: (value: string) => void
    onQuantityChange: (value: string) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const AdminUpdateMedicineComponentView = (props: AdminUpdateMedicineComponentViewProps) => {
    const {
        medicineCode,
        price,
        quantity,
        medicineSuggestions,
        showSuggestions,
        medicinesLoading,
        medicinesError,
        submitting,
        onMedicineCodeChange,
        onMedicineCodeFocus,
        onMedicineCodeBlur,
        onSuggestionSelect,
        onPriceChange,
        onQuantityChange,
        onSubmit,
    } = props

    return (
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Update Medicine Price / Stock</h2>
                <Link
                    to="/pharma-plus/admin"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                    Back to Dashboard
                </Link>
            </div>
            <form className="grid max-w-2xl gap-3" onSubmit={onSubmit}>
                <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Medicine Code
                    <div className="relative">
                        <input
                            value={medicineCode}
                            onChange={(event) => onMedicineCodeChange(event.target.value)}
                            onFocus={onMedicineCodeFocus}
                            onBlur={onMedicineCodeBlur}
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                        />
                        {showSuggestions && (
                            <div className="absolute left-0 right-0 z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                                {medicineSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.code}
                                        type="button"
                                        onClick={() => onSuggestionSelect(suggestion.code)}
                                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        <strong>{suggestion.code}</strong>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{suggestion.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {medicinesLoading && <small className="text-xs text-slate-500 dark:text-slate-400">Loading medicine codes...</small>}
                    {medicinesError && <small className="text-xs font-semibold text-rose-600 dark:text-rose-300">{medicinesError}</small>}
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Price
                    <input type="number" min="0" step="0.01" value={price} onChange={(event) => onPriceChange(event.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Quantity
                    <input type="number" min="0" value={quantity} onChange={(event) => onQuantityChange(event.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                </label>
                <button type="submit" disabled={submitting} className="mt-2 w-fit rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70">
                    {submitting ? 'Updating...' : 'Update Stock'}
                </button>
            </form>
        </section>
    )
}
