export class StockResponseModel {

    medicineName!: string | null;
    medicineCode!: string | null;
    category!: string | null;
    categoryCode!: string | null;
    price!: number;
    quantity!: number;
    mfgDate!: Date;
    expDate!: Date;

}