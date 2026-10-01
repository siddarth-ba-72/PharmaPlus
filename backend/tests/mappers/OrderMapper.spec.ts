import { OrderMapper } from '../../mappers/OrderMapper';
import { CartMapper } from '../../mappers/CartMapper';

describe('OrderMapper', () => {
  it('stores each medicine unit price from the order price snapshot', async () => {
    const mapper = new OrderMapper();
    const result = await mapper.toOrderMedicinesEntityArray(
      [
        {
          medicine: { medicineCode: 'DOL650' },
          quantity: 2,
        } as any,
      ],
      'ORD-123',
      { DOL650: 18 }
    );

    expect(result[0].unitPrice).toBe(18);
    expect(result[0].lineTotal).toBe(36);
  });

  it('includes current unit and line prices in cart responses', async () => {
    const mapper = new CartMapper();
    const result = await mapper.mapToCartResponse(
      [
        {
          medicine: { medicineCode: 'DOL650', medicineName: 'Dolo 650' },
          quantity: 3,
        } as any,
      ],
      { DOL650: 18 }
    );

    expect(result[0]).toMatchObject({
      medicineCode: 'DOL650',
      medicine: 'Dolo 650',
      quantity: 3,
      unitPrice: 18,
      lineTotal: 54,
    });
  });

  it('includes line-item totals and price data for user order summaries', async () => {
    const mapper = new OrderMapper();
    const orderItem = {
      medicine: {
        medicineName: 'Dolo 650',
        category: { categoryName: 'Pain Relief' },
      },
      quantity: 2,
      unitPrice: 18,
      lineTotal: 36,
    } as any;

    const result = await mapper.mapToUserOrderResponseModel(
      {
        orderMedicineCode: 'ORD-123',
        payment: {
          paymentCode: 'TX-456',
          paymentType: {
            paymentMethod: 'UPI',
            paymentTypeCode: 'UPI',
          },
          paymentPrice: 36,
          paymentDate: new Date('2026-01-11T10:00:00Z'),
        },
        orderDate: new Date('2026-01-11T09:30:00Z'),
      } as any,
      [orderItem]
    );

    expect(result.medicines).toEqual([
      {
        medicineName: 'Dolo 650',
        category: 'Pain Relief',
        quantity: 2,
        unitPrice: 18,
        totalPrice: 36,
      },
    ]);
    expect(result.totalAmount).toBe(36);
  });
});
