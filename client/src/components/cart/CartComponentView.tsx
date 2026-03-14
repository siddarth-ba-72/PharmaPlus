import { Link } from 'react-router-dom'
import type { CartComponentViewProps } from '../../shared/props/PropModels'

const phaseClasses = {
    active: 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200',
    inactive: 'border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400',
}

export const CartComponentView = ({
    items,
    loading,
    error,
    checkoutPhase,
    deliveryAddress,
    selectedPaymentMethod,
    paymentDetails,
    paymentProgress,
    placingOrder,
    addressValidationError,
    paymentValidationError,
    orderResult,
    onAddressInputChange,
    onPaymentMethodChange,
    onPaymentInputChange,
    onProceedToPurchase,
    onContinueToSummary,
    onContinueToPayment,
    onBackToAddress,
    onBackToSummary,
    onPlaceOrder,
    onStartNewCheckout,
}: CartComponentViewProps) => {
    const totalItemUnits = items.reduce((total, item) => total + item.quantity, 0)

    if (loading) {
        return <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-sm text-slate-600 shadow dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">Loading cart items...</section>
    }

    if (error) {
        return <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{error}</section>
    }

    return (
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/95 sm:p-8">
            <div className="pointer-events-none absolute right-[-100px] top-[-80px] h-60 w-60 rounded-full bg-emerald-200/40 blur-3xl dark:bg-emerald-900/30" />
            <div className="pointer-events-none absolute left-[-80px] bottom-[-110px] h-64 w-64 rounded-full bg-cyan-200/40 blur-3xl dark:bg-cyan-900/20" />

            <div className="relative">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">Secure Checkout</p>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">My Cart</h2>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-200">
                        {items.length} medicine{items.length === 1 ? '' : 's'} • {totalItemUnits} total units
                    </div>
                </div>

                {items.length === 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-400">
                        <p>Your cart is empty.</p>
                        <Link
                            to="/pharma-plus/medicines"
                            className="mt-3 inline-flex rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                        >
                            Browse Medicines
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-950/80">
                            <table className="min-w-[420px] w-full border-collapse text-sm">
                                <thead className="bg-slate-100/90 dark:bg-slate-800/80">
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

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-emerald-50 p-4 dark:border-slate-700 dark:from-slate-900 dark:to-slate-900">
                            <p className="text-sm text-slate-600 dark:text-slate-300">Ready to continue? Start the 3-step checkout to place your order.</p>
                            <button
                                type="button"
                                onClick={onProceedToPurchase}
                                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                                Proceed To Purchase
                            </button>
                        </div>
                    </>
                )}

                {items.length > 0 && (
                    <div className="mt-7 rounded-2xl border border-slate-200 bg-white/85 p-4 dark:border-slate-700 dark:bg-slate-950/80 sm:p-6">
                        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${checkoutPhase === 1 ? phaseClasses.active : phaseClasses.inactive}`}>
                                1. Delivery Address
                            </div>
                            <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${checkoutPhase === 2 ? phaseClasses.active : phaseClasses.inactive}`}>
                                2. Order Summary
                            </div>
                            <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${checkoutPhase === 3 ? phaseClasses.active : phaseClasses.inactive}`}>
                                3. Payment
                            </div>
                        </div>

                        {checkoutPhase === 1 && (
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phase 1: Delivery Address</h3>
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <input name="fullName" value={deliveryAddress.fullName} onChange={onAddressInputChange} placeholder="Full Name" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                    <input name="phoneNumber" value={deliveryAddress.phoneNumber} onChange={onAddressInputChange} placeholder="Phone Number" maxLength={10} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                    <input name="addressLine1" value={deliveryAddress.addressLine1} onChange={onAddressInputChange} placeholder="Address Line 1" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:col-span-2" />
                                    <input name="addressLine2" value={deliveryAddress.addressLine2} onChange={onAddressInputChange} placeholder="Address Line 2 (optional)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:col-span-2" />
                                    <input name="city" value={deliveryAddress.city} onChange={onAddressInputChange} placeholder="City" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                    <input name="state" value={deliveryAddress.state} onChange={onAddressInputChange} placeholder="State" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                    <input name="pincode" value={deliveryAddress.pincode} onChange={onAddressInputChange} placeholder="Pincode" maxLength={6} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                    <input name="landmark" value={deliveryAddress.landmark} onChange={onAddressInputChange} placeholder="Landmark (optional)" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                </div>
                                {addressValidationError && (
                                    <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{addressValidationError}</p>
                                )}
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={onContinueToSummary}
                                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                    >
                                        Continue To Summary
                                    </button>
                                </div>
                            </div>
                        )}

                        {checkoutPhase === 2 && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phase 2: Review Your Order</h3>

                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Deliver To</p>
                                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                        {deliveryAddress.fullName} • {deliveryAddress.phoneNumber}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                        {deliveryAddress.addressLine1}{deliveryAddress.addressLine2 ? `, ${deliveryAddress.addressLine2}` : ''}, {deliveryAddress.city}, {deliveryAddress.state} - {deliveryAddress.pincode}
                                    </p>
                                    {deliveryAddress.landmark && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Landmark: {deliveryAddress.landmark}</p>
                                    )}
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950/70">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Items In This Order</p>
                                    <ul className="mt-3 space-y-2">
                                        {items.map((item) => (
                                            <li key={item.medicineCode} className="flex items-center justify-between gap-3 text-sm">
                                                <span className="font-medium text-slate-800 dark:text-slate-200">{item.medicine}</span>
                                                <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200">Qty {item.quantity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-4 border-t border-dashed border-slate-300 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                        Total units: <span className="font-bold text-slate-900 dark:text-slate-100">{totalItemUnits}</span>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                                    Final payable amount is calculated by the server at payment step based on current stock pricing.
                                </div>

                                <div className="flex flex-wrap justify-between gap-3">
                                    <button
                                        type="button"
                                        onClick={onBackToAddress}
                                        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                    >
                                        Back To Address
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onContinueToPayment}
                                        className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
                                    >
                                        Continue To Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {checkoutPhase === 3 && (
                            <div className="space-y-5">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Phase 3: Payment</h3>

                                {orderResult ? (
                                    <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-5 dark:border-emerald-800 dark:bg-emerald-950/40">
                                        <p className="text-lg font-bold text-emerald-800 dark:text-emerald-200">Payment successful and order placed!</p>
                                        <p className="mt-2 text-sm text-emerald-900 dark:text-emerald-100">Order Number: <strong>{orderResult.orderNumber}</strong></p>
                                        <p className="text-sm text-emerald-900 dark:text-emerald-100">Transaction: <strong>{orderResult.transaction}</strong></p>
                                        <p className="text-sm text-emerald-900 dark:text-emerald-100">Total Paid: <strong>Rs. {orderResult.totalAmount.toFixed(2)}</strong></p>
                                        <button
                                            type="button"
                                            onClick={onStartNewCheckout}
                                            className="mt-4 rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
                                        >
                                            Start New Checkout
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                                            <button type="button" onClick={() => onPaymentMethodChange('upi')} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selectedPaymentMethod === 'upi' ? phaseClasses.active : phaseClasses.inactive}`}>
                                                UPI
                                            </button>
                                            <button type="button" onClick={() => onPaymentMethodChange('card')} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selectedPaymentMethod === 'card' ? phaseClasses.active : phaseClasses.inactive}`}>
                                                Card
                                            </button>
                                            <button type="button" onClick={() => onPaymentMethodChange('cod')} className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${selectedPaymentMethod === 'cod' ? phaseClasses.active : phaseClasses.inactive}`}>
                                                Cash On Delivery
                                            </button>
                                        </div>

                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/60">
                                            {selectedPaymentMethod === 'upi' && (
                                                <div className="space-y-3">
                                                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pay instantly with UPI</p>
                                                    <input name="upiId" value={paymentDetails.upiId} onChange={onPaymentInputChange} placeholder="name@bank" className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                                </div>
                                            )}

                                            {selectedPaymentMethod === 'card' && (
                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                    <input name="cardName" value={paymentDetails.cardName} onChange={onPaymentInputChange} placeholder="Name on Card" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:col-span-2" />
                                                    <input name="cardNumber" value={paymentDetails.cardNumber} onChange={onPaymentInputChange} placeholder="1234123412341234" maxLength={16} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 sm:col-span-2" />
                                                    <input name="cardExpiry" value={paymentDetails.cardExpiry} onChange={onPaymentInputChange} placeholder="MM/YY" maxLength={5} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                                    <input name="cardCvv" value={paymentDetails.cardCvv} onChange={onPaymentInputChange} placeholder="CVV" maxLength={3} className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100" />
                                                </div>
                                            )}

                                            {selectedPaymentMethod === 'cod' && (
                                                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
                                                    You selected Cash On Delivery. Please keep exact amount ready at delivery time.
                                                </div>
                                            )}
                                        </div>

                                        {paymentValidationError && (
                                            <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-200">{paymentValidationError}</p>
                                        )}

                                        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-950/80">
                                            <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                <span>Mock payment progress</span>
                                                <span>{paymentProgress}%</span>
                                            </div>
                                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300" style={{ width: `${paymentProgress}%` }} />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap justify-between gap-3">
                                            <button
                                                type="button"
                                                onClick={onBackToSummary}
                                                disabled={placingOrder}
                                                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                                            >
                                                Back To Summary
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    void onPlaceOrder()
                                                }}
                                                disabled={placingOrder}
                                                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                                            >
                                                {placingOrder ? 'Processing Payment...' : 'Pay & Place Order'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}
