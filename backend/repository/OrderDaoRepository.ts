import { DataSource, Repository } from "typeorm";
import { FrequentlyOrderedMedicine, OrderDao } from "../dao/OrderDao";
import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";
import { DatabaseConnectionConfig } from "../config/DatabaseConnectionConfig";
import { CartSchema } from "../schema/CartSchema";
import { OrderMapper } from "../mappers/OrderMapper";

export class OrderDaoRepository implements OrderDao {

    private dataSource: DataSource;
    private orderMedicineRepository: Repository<OrderMedicineSchema>;
    private orderRepository: Repository<OrderSchema>;
    private orderMapper: OrderMapper;

    constructor() {
        this.dataSource = DatabaseConnectionConfig.getInstance().getDataSource();
        this.orderMedicineRepository = this.dataSource.getRepository(OrderMedicineSchema);
        this.orderRepository = this.dataSource.getRepository(OrderSchema);
        this.orderMapper = new OrderMapper();
    }

    public async addNewOrderMedicineItems(userCartItem: CartSchema[], userCode: string, orderMedicineCode: string, transactionCode: string, orderedMedicinePrices: Record<string, number>): Promise<OrderMedicineSchema[]> {
        const newOrder = await this.orderMapper.toOrderEntity(orderMedicineCode, userCode, transactionCode);
        await this.orderRepository.save(newOrder);
        const orderMedicines: OrderMedicineSchema[] = await this.orderMapper.toOrderMedicinesEntityArray(userCartItem, orderMedicineCode, orderedMedicinePrices);
        await Promise.all(orderMedicines.map((orderItem) => this.orderMedicineRepository.save(orderItem)));
        return orderMedicines;
    }

    public async findOrderByOrderMedicineCode(orderMedicineCode: string): Promise<OrderSchema | null> {
        return await this.orderRepository.findOne({
            where: {
                orderMedicineCode: orderMedicineCode
            }
        });
    }

    public async findOrdersByUserCode(userCode: string): Promise<OrderSchema[] | null> {
        return await this.orderRepository.find({
            where: {
                user: {
                    userCode: userCode
                }
            }
        });
    }

    public async findOrderMedicineByOrder(orderMedicineCode: string): Promise<OrderMedicineSchema[] | null> {
        return await this.orderMedicineRepository.find({
            where: {
                order: {
                    orderMedicineCode: orderMedicineCode
                }
            }
        });
    }

    public async findFrequentlyOrderedMedicinesByUserCode(userCode: string, limit: number): Promise<FrequentlyOrderedMedicine[]> {
        const rows = await this.orderMedicineRepository
            .createQueryBuilder("orderMedicine")
            .innerJoin("orderMedicine.order", "order")
            .innerJoin("order.user", "orderUser")
            .innerJoin("orderMedicine.medicine", "medicine")
            .where("orderUser.userCode = :userCode", { userCode })
            .select("medicine.medicineCode", "medicineCode")
            .addSelect("SUM(orderMedicine.quantity)", "totalQuantity")
            .groupBy("medicine.medicineCode")
            .orderBy("\"totalQuantity\"", "DESC")
            .limit(limit)
            .getRawMany();

        return rows.map((row) => ({
            medicineCode: row.medicineCode,
            totalQuantity: Number(row.totalQuantity),
        }));
    }

}