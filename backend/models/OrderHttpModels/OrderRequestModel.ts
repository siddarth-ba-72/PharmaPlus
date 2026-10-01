export class OrderRequestModel {
    paymentPrice!: number;
    paymentTypeCode!: string;
    expectedItems?: {
        medicineCode: string;
        quantity: number;
        unitPrice: number;
    }[];
}