
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
        return <section className="medicines-wrapper">Loading medicines...</section>
    }

    if (error) {
        return <section className="medicines-wrapper error-text">{error}</section>
    }

    return (
        <section className="medicines-wrapper">
            <div className="medicines-header">
                <h2>Medicines</h2>
                <p>{`Showing ${medicines.length} of ${pageSize} per page`}</p>
            </div>

            <div className="medicines-filters">
                <label>
                    Category
                    <select value={selectedCategory} onChange={(event) => onCategoryChange(event.target.value)}>
                        <option value="all">All</option>
                        {categoryOptions.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Min Price
                    <input
                        type="number"
                        min="0"
                        value={minPrice}
                        onChange={(event) => onMinPriceChange(event.target.value)}
                        placeholder="0"
                    />
                </label>
                <label>
                    Max Price
                    <input
                        type="number"
                        min="0"
                        value={maxPrice}
                        onChange={(event) => onMaxPriceChange(event.target.value)}
                        placeholder="1000"
                    />
                </label>
                <button type="button" onClick={onClearFilters}>
                    Clear Filters
                </button>
            </div>

            <div className="medicines-grid">
                {medicines.map((medicine) => (
                    <button
                        key={medicine.medicineCode}
                        type="button"
                        className="medicine-card"
                        onClick={() => onMedicineClick(medicine.medicineCode)}
                    >
                        <h3>{medicine.medicineName}</h3>
                        <p><strong>Code:</strong> {medicine.medicineCode}</p>
                        <p><strong>Category:</strong> {medicine.category ?? 'Uncategorized'}</p>
                        <p><strong>Price:</strong> {medicine.price === null ? 'N/A' : `Rs. ${medicine.price}`}</p>
                        <p><strong>Stock Remaining:</strong> {medicine.quantity === null ? 'N/A' : medicine.quantity}</p>
                        <p className="medicine-composition">{medicine.composition}</p>
                    </button>
                ))}
            </div>

            <div className="medicines-pagination">
                <button type="button" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>
                    Previous
                </button>
                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                <button type="button" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
                    Next
                </button>
            </div>
        </section>
    )
}
