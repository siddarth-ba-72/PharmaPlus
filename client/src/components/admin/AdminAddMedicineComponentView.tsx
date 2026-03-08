import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'

type AdminAddMedicineComponentViewProps = {
    medicineName: string
    medicineCode: string
    composition: string
    categoryCode: string
    submitting: boolean
    onMedicineNameChange: (value: string) => void
    onMedicineCodeChange: (value: string) => void
    onCompositionChange: (value: string) => void
    onCategoryCodeChange: (value: string) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const AdminAddMedicineComponentView = (props: AdminAddMedicineComponentViewProps) => {
    const {
        medicineName,
        medicineCode,
        composition,
        categoryCode,
        submitting,
        onMedicineNameChange,
        onMedicineCodeChange,
        onCompositionChange,
        onCategoryCodeChange,
        onSubmit,
    } = props

    return (
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Add Medicine</h2>
                <Link
                    to="/pharma-plus/admin"
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300"
                >
                    Back to Dashboard
                </Link>
            </div>
            <form className="grid max-w-2xl gap-3" onSubmit={onSubmit}>
                <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Medicine Name
                    <input value={medicineName} onChange={(event) => onMedicineNameChange(event.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Medicine Code
                    <input value={medicineCode} onChange={(event) => onMedicineCodeChange(event.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Composition
                    <textarea value={composition} onChange={(event) => onCompositionChange(event.target.value)} required className="min-h-24 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                </label>
                <label className="grid gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
                    Category Code
                    <input value={categoryCode} onChange={(event) => onCategoryCodeChange(event.target.value)} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                </label>
                <button type="submit" disabled={submitting} className="mt-2 w-fit rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70">
                    {submitting ? 'Saving...' : 'Save Medicine'}
                </button>
            </form>
        </section>
    )
}
