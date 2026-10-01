export class UserOrderMedicineResponseModel {

    medicineName!: string;
    category!: string;
    quantity!: number;
    unitPrice!: number;
    totalPrice!: number;

}

export class UserOrderResponseModel {

    orderNumber!: string;
    transaction!: string;
    paymentMethod!: string;
    medicines!: UserOrderMedicineResponseModel[];
    totalAmount!: number;
    orderDate!: Date;
    paymentDate!: Date;

}