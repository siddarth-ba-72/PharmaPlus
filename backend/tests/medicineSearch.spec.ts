import { matchesMedicineSearch } from '../../client/src/shared/utils/medicineSearch'

describe('matchesMedicineSearch', () => {
  it('matches medicine names, codes, and categories case-insensitively', () => {
    const medicine = {
      medicineName: 'Paracetamol',
      medicineCode: 'PARA-101',
      composition: 'Acetaminophen tablets',
      category: 'Pain Relief',
      price: 45,
      quantity: 12,
    }

    expect(matchesMedicineSearch(medicine, 'paracetamol')).toBe(true)
    expect(matchesMedicineSearch(medicine, 'para-101')).toBe(true)
    expect(matchesMedicineSearch(medicine, 'pain')).toBe(true)
    expect(matchesMedicineSearch(medicine, 'antibiotic')).toBe(false)
  })

  it('returns true when the search term is empty', () => {
    const medicine = {
      medicineName: 'Vitamin C',
      medicineCode: 'VIT-C',
      composition: 'Ascorbic acid',
      category: 'Supplements',
      price: 99,
      quantity: 6,
    }

    expect(matchesMedicineSearch(medicine, '   ')).toBe(true)
  })
})
