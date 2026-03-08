import type { MedicinesComponentViewProps } from '../../shared/props/PropModels'

export const MedicinesComponentView = (props: MedicinesComponentViewProps) => {
    const {
        medicines,
        currentPage,
        totalPages,
        pageSize,
        selectedCategory,
        categoryOptions,
        minPrice,
        maxPrice,
        loading,
        error,
        onCategoryChange,
        onMinPriceChange,
        onMaxPriceChange,
        onClearFilters,
        onPageChange,
        onMedicineClick,
    } = props

    if (loading) {
        return <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading medicines...</section>
    }

    if (error) {
        return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{error}</section>
    }

    return (
        <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Medicines</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{`Showing ${medicines.length} of ${pageSize} per page`}</p>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Category
                        <select
                            value={selectedCategory}
                            onChange={(event) => onCategoryChange(event.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        >
                            <option value="all">All</option>
                            {categoryOptions.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Min Price
                        <input
                            type="number"
                            min="0"
                            value={minPrice}
                            onChange={(event) => onMinPriceChange(event.target.value)}
                            placeholder="0"
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Max Price
                        <input
                            type="number"
                            min="0"
                            value={maxPrice}
                            onChange={(event) => onMaxPriceChange(event.target.value)}
                            placeholder="1000"
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                        />
                    </label>
                    <button type="button" onClick={onClearFilters} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 lg:self-end dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300">
                        Clear Filters
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {medicines.map((medicine) => (
                    <button
                        key={medicine.medicineCode}
                        type="button"
                        onClick={() => onMedicineClick(medicine.medicineCode)}
                        className="group rounded-2xl border border-slate-200 bg-white/95 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-emerald-700"
                    >
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 dark:text-slate-100 dark:group-hover:text-emerald-300">{medicine.medicineName}</h3>
                        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{medicine.medicineCode}</p>
                        <div className="mt-3 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                            <p><span className="font-semibold">Category:</span> {medicine.category ?? 'Uncategorized'}</p>
                            <p><span className="font-semibold">Price:</span> {medicine.price === null ? 'N/A' : `Rs. ${medicine.price}`}</p>
                            <p><span className="font-semibold">Stock:</span> {medicine.quantity === null ? 'N/A' : medicine.quantity}</p>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{medicine.composition}</p>
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                    Previous
                </button>
                <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{`Page ${currentPage} of ${totalPages}`}</span>
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                    Next
                </button>
            </div>
        </section>
    )
}
