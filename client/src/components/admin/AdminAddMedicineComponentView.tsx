import type { FormEvent } from 'react'

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
        <section className="admin-wrapper">
            <h2>Add Medicine</h2>
            <form className="admin-form" onSubmit={onSubmit}>
                <label>
                    Medicine Name
                    <input value={medicineName} onChange={(event) => onMedicineNameChange(event.target.value)} required />
                </label>
                <label>
                    Medicine Code
                    <input value={medicineCode} onChange={(event) => onMedicineCodeChange(event.target.value)} required />
                </label>
                <label>
                    Composition
                    <textarea value={composition} onChange={(event) => onCompositionChange(event.target.value)} required />
                </label>
                <label>
                    Category Code
                    <input value={categoryCode} onChange={(event) => onCategoryCodeChange(event.target.value)} required />
                </label>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : 'Save Medicine'}
                </button>
            </form>
        </section>
    )
}
