import { CartSchema } from "../schema/CartSchema";
import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";
import { OrderMedicineResponseModel, OrderResponseModel } from "../models/OrderHttpModels/OrderResponseModel";
import { UserSchema } from "../schema/UserSchema";
import { UserOrderResponseModel } from "../models/OrderHttpModels/UserOrderResponseModel";

export class OrderMapper {

    public async toOrderMedicinesEntityArray(userCartItem: CartSchema[], orderMedicineCode: string): Promise<OrderMedicineSchema[]> {
        const orderMedicines: OrderMedicineSchema[] = [];
        userCartItem.forEach((item: CartSchema) => {
            const orderMedicine: OrderMedicineSchema = new OrderMedicineSchema();
            orderMedicine.order = { orderMedicineCode: orderMedicineCode } as any;
            orderMedicine.medicine = { medicineCode: item.medicine.medicineCode } as any;
            orderMedicine.quantity = item.quantity;
            orderMedicines.push(orderMedicine);
        });
        return orderMedicines;
    }

    public async toOrderEntity(orderMedicineCode: string, userCode: string, transactionCode: string): Promise<OrderSchema> {
        const order: OrderSchema = new OrderSchema();
        order.payment = { paymentCode: transactionCode } as any;
        order.user = { userCode: userCode } as any;
        order.orderMedicineCode = orderMedicineCode;
        return order;
    }

    public async mapToOrderResponseModel(user: UserSchema, orderCode: string, transactionCode: string, orderItems: OrderMedicineSchema[]): Promise<OrderResponseModel> {
        const orderResponse: OrderResponseModel = new OrderResponseModel();
        orderResponse.user = `${user.firstName} ${user.lastName}`;
        orderResponse.orderNumber = orderCode;
        orderResponse.transaction = transactionCode;
        const orderMedicinesResponse: OrderMedicineResponseModel[] = [];
        orderItems.forEach((item: OrderMedicineSchema) => {
            const orderMedResponse: OrderMedicineResponseModel = new OrderMedicineResponseModel();
            orderMedResponse.medicineName = item.medicine?.medicineName;
            orderMedResponse.category = item.medicine?.category?.categoryName;
            orderMedResponse.quantity = item.quantity;
            orderMedicinesResponse.push(orderMedResponse);
        });
        orderResponse.medicines = orderMedicinesResponse;
        return orderResponse;
    }

    public async mapToUserOrderResponseModel(userOrder: OrderSchema, orderMedicines: OrderMedicineSchema[] | null): Promise<UserOrderResponseModel> {
        const userOrderResponse: UserOrderResponseModel = new UserOrderResponseModel();
        const medicineNames: string[] = [];
        orderMedicines?.forEach((orderMedicine) => {
            medicineNames.push(orderMedicine.medicine.medicineName);
        });
        userOrderResponse.medicines = medicineNames;
        return userOrderResponse;
    }


}

/*

[
  OrderMedicineSchema {
    orderMedicineId: 6,
    quantity: 5,
    order: OrderSchema {
      orderId: 2,
      orderMedicineCode: '2C727FD467',
      orderDate: 2025-02-16T15:42:47.354Z,
      user: [UserSchema],
      payment: [PaymentSchema]
    },
    medicine: MedicineSchema {
      medicineId: 7,
      medicineCode: 'SINRST',
      medicineName: 'Sinarest 152',
      composition: 'xyz',
      category: [MedicineCategorySchema]
    }
  },
  OrderMedicineSchema {
    orderMedicineId: 7,
    quantity: 2,
    order: OrderSchema {
      orderId: 2,
      orderMedicineCode: '2C727FD467',
      orderDate: 2025-02-16T15:42:47.354Z,
      user: [UserSchema],
      payment: [PaymentSchema]
    },
    medicine: MedicineSchema {
      medicineId: 1,
      medicineCode: 'DOL650',
      medicineName: 'Dolo 650',
      composition: 'abc',
      category: [MedicineCategorySchema]
    }
  }
]
------------------------------------------------
OrderSchema {
  orderId: 3,
  orderMedicineCode: 'D0890284A4',
  orderDate: 2025-02-16T15:52:47.882Z,
  user: UserSchema {
    userId: 10,
    userCode: 'PBT22',
    username: 'prabhat',
    firstName: 'Prabhat',
    lastName: 'Kumar',
    emailId: 'prabhat.kumar@xyz.com',
    password: '$2a$10$S9GF8sUMNVV.EK16vIKi.eJcH8nd1Z9MHCt9pNzAeXin3u7iKFUnG',
    age: 22,
    isAdmin: false,
    createdAt: 2025-01-25T16:43:05.269Z,
    updatedAt: 2025-02-15T13:51:12.809Z
  },
  payment: PaymentSchema {
    paymentId: 5,
    paymentCode: '343FDF74E7',
    paymentPrice: 50,
    paymentDate: 2025-02-16T15:52:47.858Z,
    user: UserSchema {
      userId: 10,
      userCode: 'PBT22',
      username: 'prabhat',
      firstName: 'Prabhat',
      lastName: 'Kumar',
      emailId: 'prabhat.kumar@xyz.com',
      password: '$2a$10$S9GF8sUMNVV.EK16vIKi.eJcH8nd1Z9MHCt9pNzAeXin3u7iKFUnG',
      age: 22,
      isAdmin: false,
      createdAt: 2025-01-25T16:43:05.269Z,
      updatedAt: 2025-02-15T13:51:12.809Z
    },
    paymentType: PaymentTypeSchema {
      paymentTypeId: 1,
      paymentTypeCode: 'UPI',
      paymentMethod: 'Upi'
    }
  }
}
[
  OrderMedicineSchema {
    orderMedicineId: 8,
    quantity: 12,
    order: OrderSchema {
      orderId: 3,
      orderMedicineCode: 'D0890284A4',
      orderDate: 2025-02-16T15:52:47.882Z,
      user: [UserSchema],
      payment: [PaymentSchema]
    },
    medicine: MedicineSchema {
      medicineId: 7,
      medicineCode: 'SINRST',
      medicineName: 'Sinarest 152',
      composition: 'xyz',
      category: [MedicineCategorySchema]
    }
  },
  OrderMedicineSchema {
    orderMedicineId: 9,
    quantity: 10,
    order: OrderSchema {
      orderId: 3,
      orderMedicineCode: 'D0890284A4',
      orderDate: 2025-02-16T15:52:47.882Z,
      user: [UserSchema],
      payment: [PaymentSchema]
    },
    medicine: MedicineSchema {
      medicineId: 1,
      medicineCode: 'DOL650',
      medicineName: 'Dolo 650',
      composition: 'abc',
      category: [MedicineCategorySchema]
    }
  }
]

*/