import { Link } from 'react-router-dom'
import type { CartComponentViewProps } from '../../shared/props/PropModels'

export const CartComponentView = ({ items, loading, error }: CartComponentViewProps) => {
    if (loading) {
        return <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading cart items...</section>
    }

    if (error) {
        return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{error}</section>
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">My Cart</h2>
            {items.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Your cart is empty.</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
                    <table className="min-w-[420px] w-full border-collapse text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-800">
                            <tr>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Medicine</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-200">Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={`${item.medicineCode}-${index}`} className="border-t border-slate-200 dark:border-slate-700">
                                    <td className="px-4 py-3">
                                        <Link
                                            to={`/pharma-plus/medicines/${item.medicineCode}`}
                                            className="font-semibold text-emerald-700 hover:underline dark:text-emerald-300"
                                        >
                                            {item.medicine}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    )
}
