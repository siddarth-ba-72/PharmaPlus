import { Link, useLocation } from 'react-router-dom'
import type { OrderResponseDto } from '../../shared/dto/OrderDto'
import { useUserOrdersQuery } from '../../shared/queries/OrderQueries'

type MyOrdersLocationState = {
    justPlacedOrder?: OrderResponseDto
}

export const MyOrdersComponent = () => {
    const location = useLocation()
    const locationState = (location.state ?? {}) as MyOrdersLocationState
    const justPlacedOrder = locationState.justPlacedOrder ?? null
    const userOrdersQuery = useUserOrdersQuery()

    const orders = [...(userOrdersQuery.data ?? [])].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())

    const formatCurrency = (amount: number): string => `Rs. ${amount.toFixed(2)}`
    const formatDateTime = (value: string): string => new Date(value).toLocaleString()

    if (userOrdersQuery.isLoading) {
        return <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading your order summary...</section>
    }

    if (userOrdersQuery.error instanceof Error) {
        return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{userOrdersQuery.error.message}</section>
    }

    return (
        <section className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Order Summary</p>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">My Orders</h2>
                </div>
                <Link to="/pharma-plus/medicines" className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    Continue Shopping
                </Link>
            </div>

            {justPlacedOrder && (
                <article className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Just Placed</p>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Order #{justPlacedOrder.orderNumber}</p>
                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{formatCurrency(justPlacedOrder.totalAmount)}</p>
                    </div>
                    <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-200">Transaction: {justPlacedOrder.transaction}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                        {justPlacedOrder.medicines.map((medicine, index) => (
                            <span key={`${justPlacedOrder.orderNumber}-${medicine.medicineName}-${index}`} className="rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-100">
                                {medicine.medicineName} x {medicine.quantity}
                            </span>
                        ))}
                    </div>
                </article>
            )}

            {orders.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
                    You have no previous orders yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <article key={`${order.orderNumber}-${order.transaction}`} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950/70">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">#{order.orderNumber}</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(order.totalAmount)}</p>
                            </div>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Transaction: {order.transaction} • {order.paymentMethod}</p>
                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Ordered: {formatDateTime(order.orderDate)}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Paid: {formatDateTime(order.paymentDate)}</p>
                            <div className="mt-2 flex flex-wrap gap-1">
                                {order.medicines.map((medicineName, index) => (
                                    <span key={`${order.orderNumber}-${index}-${medicineName}`} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{medicineName}</span>
                                ))}
                            </div>
                        </article>
                    ))}
                </div>
            )}
        </section>
    )
}
