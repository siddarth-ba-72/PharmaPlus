import type { MedicineListItem } from '../props/PropModels'

export const matchesMedicineSearch = (
    medicine: Pick<MedicineListItem, 'medicineName' | 'medicineCode' | 'composition' | 'category'>,
    searchTerm: string,
): boolean => {
    const query = searchTerm.trim().toLowerCase()

    if (!query) {
        return true
    }

    const searchableText = [
        medicine.medicineName,
        medicine.medicineCode,
        medicine.composition,
        medicine.category ?? '',
    ]
        .join(' ')
        .toLowerCase()

    return searchableText.includes(query)
}
