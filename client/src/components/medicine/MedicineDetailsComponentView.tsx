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
        return <section className="medicine-details-wrapper">Loading medicine details...</section>
    }

    if (error) {
        return <section className="medicine-details-wrapper error-text">{error}</section>
    }

    if (!medicineStock) {
        return <section className="medicine-details-wrapper">No medicine details found.</section>
    }

    return (
        <section className="medicine-details-wrapper">
            <div className="medicine-details-card">
                <div className="medicine-details-head">
                    <h2>{medicineStock.medicineName ?? 'Medicine Details'}</h2>
                    <button type="button" onClick={onBackClick}>Back to Medicines</button>
                </div>
                <div className="medicine-details-grid">
                    <p><strong>Medicine Code:</strong> {medicineStock.medicineCode}</p>
                    <p><strong>Category:</strong> {medicineStock.category ?? 'Uncategorized'}</p>
                    <p><strong>Category Code:</strong> {medicineStock.categoryCode ?? '-'}</p>
                    <p><strong>Stock Remaining:</strong> {medicineStock.quantity}</p>
                    <p><strong>Price:</strong> Rs. {medicineStock.price}</p>
                    <p><strong>Manufactured Date:</strong> {new Date(medicineStock.mfgDate).toLocaleDateString()}</p>
                    <p><strong>Expiry Date:</strong> {new Date(medicineStock.expDate).toLocaleDateString()}</p>
                </div>
                {isAuthenticated ? (
                    <div className="medicine-cart-actions">
                        <div className="medicine-cart-controls">
                            <span className="medicine-cart-icon" aria-hidden="true">🛒</span>
                            <button type="button" onClick={onDecreaseFromCart} disabled={cartQuantity <= 0}>-</button>
                            <span>{cartQuantity}</span>
                            <button type="button" onClick={onAddToCart}>+</button>
                        </div>
                        <button type="button" onClick={onSaveCart} disabled={savingCart}>
                            {savingCart ? 'Saving Cart...' : 'Save Cart'}
                        </button>
                    </div>
                ) : (
                    <p className="medicine-login-info">Please login to purchase</p>
                )}
            </div>
        </section>
    )
}
