export class UserOrderResponseModel {

    orderNumber!: string;
    transaction!: string;
    paymentMethod!: string;
    medicines!: string[];
    totalAmount!: number;
    orderDate!: Date;
    paymentDate!: Date;

}