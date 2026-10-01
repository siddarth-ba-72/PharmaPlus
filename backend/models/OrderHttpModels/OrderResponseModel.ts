export class OrderMedicineResponseModel {

    medicineName!: string;
    category!: string;
    quantity!: number;
    unitPrice!: number;
    lineTotal!: number;

}

export class OrderResponseModel {

    user!: string;
    orderNumber!: string;
    transaction!: string;
    totalAmount!: number;
    medicines!: OrderMedicineResponseModel[];

}