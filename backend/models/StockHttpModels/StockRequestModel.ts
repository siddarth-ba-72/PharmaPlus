export class StockRequestModel {

    medicineCode!: string;
    price!: number;
    quantity!: number;
    mfgDate?: Date | string;
    expDate?: Date | string;

}