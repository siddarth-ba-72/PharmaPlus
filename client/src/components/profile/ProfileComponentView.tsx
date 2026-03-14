import type { ProfileComponentProps } from '../../shared/props/PropModels'
import { Link } from 'react-router-dom'

export const ProfileComponentView = (props: ProfileComponentProps) => {
    const {
        username,
        firstName,
        lastName,
        emailId,
        age,
        isEditing,
        submitting,
        error,
        orders,
        ordersLoading,
        ordersError,
        onEditClick,
        onCancelEdit,
        onInputChange,
        onSubmit,
    } = props

    const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    const latestOrder = sortedOrders[0] ?? null

    const formatCurrency = (amount: number): string => `Rs. ${amount.toFixed(2)}`
    const formatDateTime = (value: string): string => new Date(value).toLocaleString()

    if (!isEditing) {
        return (
            <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
                <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">My Profile</h2>
                {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">{error}</p>}
                <div className="grid grid-cols-1 gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2">
                    <p><strong>Username:</strong> {username}</p>
                    <p><strong>Email:</strong> {emailId}</p>
                    <p><strong>First Name:</strong> {firstName}</p>
                    <p><strong>Last Name:</strong> {lastName}</p>
                    <p><strong>Age:</strong> {age}</p>
                </div>
                <button type="button" onClick={onEditClick} className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700">
                    Edit Details
                </button>

                <div className="mt-7 border-t border-slate-200 pt-6 dark:border-slate-700">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">My Orders</h3>
                        <Link to="/pharma-plus/my-orders" className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300">
                            View Full History
                        </Link>
                    </div>

                    {ordersLoading ? (
                        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading your orders...</p>
                    ) : ordersError ? (
                        <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">{ordersError}</p>
                    ) : sortedOrders.length === 0 ? (
                        <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">No previous orders found.</p>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {latestOrder && (
                                <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/40">
                                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">Latest Order</p>
                                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Order #{latestOrder.orderNumber}</p>
                                        <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{formatCurrency(latestOrder.totalAmount)}</p>
                                    </div>
                                    <p className="mt-1 text-xs text-emerald-900/80 dark:text-emerald-200">Transaction: {latestOrder.transaction} • {latestOrder.paymentMethod}</p>
                                </article>
                            )}

                            <div className="space-y-3">
                                {sortedOrders.map((order) => (
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
                        </div>
                    )}
                </div>
            </section>
        )
    }

    return (
        <section className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95">
            <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Edit Profile</h2>
            {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-950/60 dark:text-rose-200">{error}</p>}
            <form className="grid gap-3" onSubmit={onSubmit}>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="username">Username</label>
                <input id="username" name="username" value={username} disabled className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" />

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" value={firstName} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" value={lastName} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="emailId">Email</label>
                <input id="emailId" name="emailId" type="email" value={emailId} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

                <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="age">Age</label>
                <input id="age" name="age" type="number" value={age} onChange={onInputChange} required className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />

                <div className="mt-2 flex gap-2">
                    <button type="button" onClick={onCancelEdit} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                        Cancel
                    </button>
                    <button type="submit" disabled={submitting} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-70">
                        {submitting ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </section>
    )
}
