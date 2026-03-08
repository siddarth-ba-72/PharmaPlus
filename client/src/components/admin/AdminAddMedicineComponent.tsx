import { useState, type FormEvent } from 'react'
import { useAddMedicineMutation } from '../../shared/queries/AdminQueries'
import { useToastStore } from '../../store/ToastStore'
import { AdminAddMedicineComponentView } from './AdminAddMedicineComponentView'

export const AdminAddMedicineComponent = () => {
    const [medicineName, setMedicineName] = useState('')
    const [medicineCode, setMedicineCode] = useState('')
    const [composition, setComposition] = useState('')
    const [categoryCode, setCategoryCode] = useState('')
    const addMedicineMutation = useAddMedicineMutation()
    const showToast = useToastStore((state) => state.showToast)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault()

        try {
            const message = await addMedicineMutation.mutateAsync({
                medicineName,
                medicineCode,
                composition,
                categoryCode,
            })
            showToast({ category: 'success', message })
            setMedicineName('')
            setMedicineCode('')
            setComposition('')
            setCategoryCode('')
        } catch (error) {
            showToast({ category: 'fail', message: error instanceof Error ? error.message : 'Unable to add medicine.' })
        }
    }

    return (
        <AdminAddMedicineComponentView
            medicineName={medicineName}
            medicineCode={medicineCode}
            composition={composition}
            categoryCode={categoryCode}
            submitting={addMedicineMutation.isPending}
            onMedicineNameChange={setMedicineName}
            onMedicineCodeChange={setMedicineCode}
            onCompositionChange={setComposition}
            onCategoryCodeChange={setCategoryCode}
            onSubmit={handleSubmit}
        />
    )
}
