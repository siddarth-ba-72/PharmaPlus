import { Link, useParams } from 'react-router-dom'
import { useUserOrdersQuery } from '../../shared/queries/OrderQueries'

export const OrderDetailsComponent = () => {
    const { orderNumber } = useParams()
    const userOrdersQuery = useUserOrdersQuery()

    const formatCurrency = (amount: number): string => `Rs. ${amount.toFixed(2)}`
    const formatDateTime = (value: string): string => new Date(value).toLocaleString()

    const order = (userOrdersQuery.data ?? []).find((entry) => entry.orderNumber === orderNumber) ?? null

    if (userOrdersQuery.isLoading) {
        return <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading order details...</section>
    }

    if (userOrdersQuery.error instanceof Error) {
        return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{userOrdersQuery.error.message}</section>
    }

    if (!order) {
        return (
            <section className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">Order not found</p>
                <Link to="/pharma-plus/my-orders" className="mt-4 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    Back to My Orders
                </Link>
            </section>
        )
    }

    const orderSubTotal = order.medicines.reduce((sum, medicine) => sum + medicine.totalPrice, 0)

    return (
        <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Order Summary</p>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Order #{order.orderNumber}</h2>
                </div>
                <Link to="/pharma-plus/my-orders" className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300">
                    Back to My Orders
                </Link>
            </div>

            <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60 md:grid-cols-2">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Transaction ID</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{order.transaction}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Payment Method</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{order.paymentMethod}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Ordered On</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{formatDateTime(order.orderDate)}</p>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Paid On</p>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{formatDateTime(order.paymentDate)}</p>
                </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950/70">
                <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300">
                    <span>Medicine</span>
                    <span>Qty</span>
                    <span>Unit price</span>
                    <span className="text-right">Line total</span>
                </div>

                {order.medicines.map((medicine, index) => (
                    <div key={`${order.orderNumber}-${medicine.medicineName}-${index}`} className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-3 border-b border-slate-200 px-4 py-3 text-sm last:border-b-0 dark:border-slate-700">
                        <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{medicine.medicineName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{medicine.category}</p>
                        </div>
                        <span className="text-slate-700 dark:text-slate-200">{medicine.quantity}</span>
                        <span className="text-slate-700 dark:text-slate-200">{formatCurrency(medicine.unitPrice)}</span>
                        <span className="text-right font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(medicine.totalPrice)}</span>
                    </div>
                ))}
            </div>

            <div className="mt-6 flex flex-col items-end gap-2 rounded-2xl bg-emerald-50 p-4 dark:bg-emerald-950/30">
                <div className="flex w-full max-w-xs items-center justify-between text-sm text-slate-700 dark:text-slate-200">
                    <span>Subtotal</span>
                    <span>{formatCurrency(orderSubTotal)}</span>
                </div>
                <div className="flex w-full max-w-xs items-center justify-between text-lg font-bold text-slate-900 dark:text-slate-100">
                    <span>Total</span>
                    <span>{formatCurrency(order.totalAmount)}</span>
                </div>
            </div>
        </section>
    )
}
