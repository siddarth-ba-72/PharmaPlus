import { CartSchema } from "../schema/CartSchema";
import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";
import { OrderMedicineResponseModel, OrderResponseModel } from "../models/OrderHttpModels/OrderResponseModel";
import { UserSchema } from "../schema/UserSchema";
import { UserOrderResponseModel } from "../models/OrderHttpModels/UserOrderResponseModel";

export class OrderMapper {

  public async toOrderMedicinesEntityArray(userCartItem: CartSchema[], orderMedicineCode: string, orderedMedicinePrices: Record<string, number>): Promise<OrderMedicineSchema[]> {
    const orderMedicines: OrderMedicineSchema[] = [];
    userCartItem.forEach((item: CartSchema) => {
      const orderMedicine: OrderMedicineSchema = new OrderMedicineSchema();
      orderMedicine.order = { orderMedicineCode: orderMedicineCode } as any;
      orderMedicine.medicine = { medicineCode: item.medicine.medicineCode } as any;
      orderMedicine.quantity = item.quantity;
      orderMedicine.unitPrice = orderedMedicinePrices[item.medicine.medicineCode];
      orderMedicine.lineTotal = orderMedicine.unitPrice * orderMedicine.quantity;
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

  public async mapToOrderResponseModel(user: UserSchema, orderCode: string, transactionCode: string, totalAmount: number, orderItems: OrderMedicineSchema[]): Promise<OrderResponseModel> {
    const orderResponse: OrderResponseModel = new OrderResponseModel();
    orderResponse.user = `${user.firstName} ${user.lastName}`;
    orderResponse.orderNumber = orderCode;
    orderResponse.transaction = transactionCode;
    orderResponse.totalAmount = totalAmount;
    const orderMedicinesResponse: OrderMedicineResponseModel[] = [];
    orderItems.forEach((item: OrderMedicineSchema) => {
      const orderMedResponse: OrderMedicineResponseModel = new OrderMedicineResponseModel();
      const unitPrice = Number(item.unitPrice ?? 0);
      const quantity = Number(item.quantity ?? 0);
      orderMedResponse.medicineName = item.medicine?.medicineName;
      orderMedResponse.category = item.medicine?.category?.categoryName;
      orderMedResponse.quantity = quantity;
      orderMedResponse.unitPrice = unitPrice;
      orderMedResponse.lineTotal = Number(item.lineTotal ?? 0) || unitPrice * quantity;
      orderMedicinesResponse.push(orderMedResponse);
    });
    orderResponse.medicines = orderMedicinesResponse;
    return orderResponse;
  }

  public async mapToUserOrderResponseModel(userOrder: OrderSchema, orderMedicines: OrderMedicineSchema[] | null): Promise<UserOrderResponseModel> {
    const userOrderResponse: UserOrderResponseModel = new UserOrderResponseModel();
    userOrderResponse.medicines = (orderMedicines ?? []).map((orderMedicine) => {
      const unitPrice = Number(orderMedicine.unitPrice ?? 0);
      const quantity = Number(orderMedicine.quantity ?? 0);
      return {
        medicineName: orderMedicine.medicine?.medicineName ?? "",
        category: orderMedicine.medicine?.category?.categoryName ?? "",
        quantity,
        unitPrice,
        totalPrice: Number(orderMedicine.lineTotal ?? 0) || unitPrice * quantity,
      };
    });
    userOrderResponse.orderNumber = userOrder.orderMedicineCode;
    userOrderResponse.transaction = userOrder.payment?.paymentCode ?? "";
    userOrderResponse.paymentMethod = userOrder.payment?.paymentType?.paymentMethod ?? userOrder.payment?.paymentType?.paymentTypeCode ?? "";
    userOrderResponse.totalAmount = userOrder.payment?.paymentPrice ?? 0;
    userOrderResponse.orderDate = userOrder.orderDate;
    userOrderResponse.paymentDate = userOrder.payment?.paymentDate ?? userOrder.orderDate;
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