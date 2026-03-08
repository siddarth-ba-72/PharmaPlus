import type { FormEvent } from 'react'

type AdminUpdateMedicineComponentViewProps = {
    medicineCode: string
    price: string
    quantity: string
    medicineSuggestions: Array<{ code: string; name: string }>
    showSuggestions: boolean
    medicinesLoading: boolean
    medicinesError: string | null
    submitting: boolean
    onMedicineCodeChange: (value: string) => void
    onMedicineCodeFocus: () => void
    onMedicineCodeBlur: () => void
    onSuggestionSelect: (value: string) => void
    onPriceChange: (value: string) => void
    onQuantityChange: (value: string) => void
    onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export const AdminUpdateMedicineComponentView = (props: AdminUpdateMedicineComponentViewProps) => {
    const {
        medicineCode,
        price,
        quantity,
        medicineSuggestions,
        showSuggestions,
        medicinesLoading,
        medicinesError,
        submitting,
        onMedicineCodeChange,
        onMedicineCodeFocus,
        onMedicineCodeBlur,
        onSuggestionSelect,
        onPriceChange,
        onQuantityChange,
        onSubmit,
    } = props

    return (
        <section className="admin-wrapper">
            <h2>Update Medicine Price / Stock</h2>
            <form className="admin-form" onSubmit={onSubmit}>
                <label>
                    Medicine Code
                    <div className="admin-autocomplete">
                        <input
                            value={medicineCode}
                            onChange={(event) => onMedicineCodeChange(event.target.value)}
                            onFocus={onMedicineCodeFocus}
                            onBlur={onMedicineCodeBlur}
                            required
                        />
                        {showSuggestions && (
                            <div className="admin-autocomplete-list">
                                {medicineSuggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.code}
                                        type="button"
                                        className="admin-autocomplete-item"
                                        onClick={() => onSuggestionSelect(suggestion.code)}
                                    >
                                        <strong>{suggestion.code}</strong>
                                        <span>{suggestion.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {medicinesLoading && <small>Loading medicine codes...</small>}
                    {medicinesError && <small className="error-text">{medicinesError}</small>}
                </label>
                <label>
                    Price
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={price}
                        onChange={(event) => onPriceChange(event.target.value)}
                        required
                    />
                </label>
                <label>
                    Quantity
                    <input
                        type="number"
                        min="0"
                        value={quantity}
                        onChange={(event) => onQuantityChange(event.target.value)}
                        required
                    />
                </label>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Stock'}
                </button>
            </form>
        </section>
    )
}
