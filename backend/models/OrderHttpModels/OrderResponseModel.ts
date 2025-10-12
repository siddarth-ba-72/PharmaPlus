export class OrderMedicineResponseModel {

    medicineName!: string;
    category!: string;
    quantity!: number;
    price!: number;

}

export class OrderResponseModel {

    user!: string;
    orderNumber!: string;
    transaction!: string;
    medicines!: OrderMedicineResponseModel[];

}