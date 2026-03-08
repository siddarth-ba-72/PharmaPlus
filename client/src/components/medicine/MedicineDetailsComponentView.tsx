import type { MedicineDetailsComponentViewProps } from '../../shared/props/PropModels'

export const MedicineDetailsComponentView = (props: MedicineDetailsComponentViewProps) => {
    const {
        medicineStock,
        isAuthenticated,
        cartQuantity,
        savingCart,
        loading,
        error,
        onAddToCart,
        onDecreaseFromCart,
        onSaveCart,
        onBackClick,
    } = props

    if (loading) {
        return <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading medicine details...</section>
    }

    if (error) {
        return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{error}</section>
    }

    if (!medicineStock) {
        return <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">No medicine details found.</section>
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {medicineStock.medicineName ?? 'Medicine Details'}
                </h2>
                <button
                    type="button"
                    onClick={onBackClick}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 sm:w-auto dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                    Back to Medicines
                </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                <p><strong>Medicine Code:</strong> {medicineStock.medicineCode}</p>
                <p><strong>Category:</strong> {medicineStock.category ?? 'Uncategorized'}</p>
                <p><strong>Category Code:</strong> {medicineStock.categoryCode ?? '-'}</p>
                <p><strong>Stock Remaining:</strong> {medicineStock.quantity}</p>
                <p><strong>Price:</strong> Rs. {medicineStock.price}</p>
                <p><strong>Manufactured Date:</strong> {new Date(medicineStock.mfgDate).toLocaleDateString()}</p>
                <p><strong>Expiry Date:</strong> {new Date(medicineStock.expDate).toLocaleDateString()}</p>
            </div>

            {isAuthenticated ? (
                <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                    <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 sm:justify-start dark:border-slate-700 dark:bg-slate-950">
                        <span className="text-base">Cart</span>
                        <button
                            type="button"
                            onClick={onDecreaseFromCart}
                            disabled={cartQuantity <= 0}
                            className="rounded-lg bg-slate-200 px-3 py-1 text-sm font-bold text-slate-800 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        >
                            -
                        </button>
                        <span className="min-w-6 text-center text-sm font-semibold">{cartQuantity}</span>
                        <button
                            type="button"
                            onClick={onAddToCart}
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-sm font-bold text-white transition hover:bg-emerald-700"
                        >
                            +
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onSaveCart}
                        disabled={savingCart}
                        className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70 sm:w-auto"
                    >
                        {savingCart ? 'Saving Cart...' : 'Save Cart'}
                    </button>
                </div>
            ) : (
                <p className="mt-6 rounded-lg bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                    Please login to purchase
                </p>
            )}
        </section>
    )
}
