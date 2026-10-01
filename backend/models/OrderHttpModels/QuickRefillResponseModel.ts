export class QuickRefillResponseModel {

    medicineCode!: string;
    medicineName!: string;
    category!: string;
    totalOrderedQuantity!: number;
    price!: number | null;
    availableStock!: number | null;

}
