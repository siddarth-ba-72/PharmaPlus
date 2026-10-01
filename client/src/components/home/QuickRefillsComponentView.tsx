import type { QuickRefillsComponentViewProps } from '../../shared/props/PropModels'

export const QuickRefillsComponentView = (props: QuickRefillsComponentViewProps) => {
    const { items, loading, error, savingMedicineCode, onIncrement, onDecrement, onAddToCart, onMedicineClick } = props

    if (loading) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Trebuchet MS, Verdana, sans-serif' }}>Quick Refills</h2>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600 dark:border-slate-700 dark:border-t-emerald-400"
                        aria-hidden="true"
                    />
                    <span>Loading quick refills...</span>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">
                {error}
            </section>
        )
    }

    if (items.length === 0) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Trebuchet MS, Verdana, sans-serif' }}>Quick Refills</h2>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    You haven't ordered anything yet. Place your first order to see quick refills here.
                </p>
            </section>
        )
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Trebuchet MS, Verdana, sans-serif' }}>Quick Refills</h2>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Based on your past orders</p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item) => {
                    const outOfStock = item.availableStock !== null && item.availableStock <= 0
                    const atStockLimit = item.availableStock !== null && item.selectedQuantity >= item.availableStock
                    const isSaving = savingMedicineCode === item.medicineCode

                    return (
                        <article
                            key={item.medicineCode}
                            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                        >
                            <div>
                                <button
                                    type="button"
                                    onClick={() => onMedicineClick(item.medicineCode)}
                                    className="text-left text-base font-bold text-slate-900 hover:text-emerald-700 dark:text-slate-100 dark:hover:text-emerald-300"
                                >
                                    {item.medicineName}
                                </button>
                                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.category || 'Uncategorized'}</p>
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Ordered {item.totalOrderedQuantity} times before</p>
                                <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                                    {item.price === null ? 'Price unavailable' : `Rs. ${item.price}`}
                                    {outOfStock ? <span className="ml-2 font-semibold text-rose-600 dark:text-rose-400">Out of stock</span> : null}
                                </p>
                            </div>

                            <div className="mt-4 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-950">
                                    <button
                                        type="button"
                                        onClick={() => onDecrement(item.medicineCode)}
                                        disabled={item.selectedQuantity <= 0}
                                        className="rounded-lg bg-slate-200 px-2.5 py-1 text-sm font-bold text-slate-800 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                                    >
                                        -
                                    </button>
                                    <span className="min-w-6 text-center text-sm font-semibold">{item.selectedQuantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => onIncrement(item.medicineCode)}
                                        disabled={outOfStock || atStockLimit}
                                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        +
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => onAddToCart(item.medicineCode)}
                                    disabled={isSaving || outOfStock || item.selectedQuantity <= 0}
                                    className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSaving ? 'Adding...' : 'Add To Cart'}
                                </button>
                            </div>
                        </article>
                    )
                })}
            </div>
        </section>
    )
}
