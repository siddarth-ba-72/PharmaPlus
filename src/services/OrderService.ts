import { DataSource, Repository } from "typeorm";
import { OrderDao } from "../dao/OrderDao";
import { OrderMedicineSchema } from "../schema/OrderMedicineSchema";
import { OrderSchema } from "../schema/OrderSchema";
import DatabaseConnection from "../middlewares/DatabaseConnection";
import { CartSchema } from "../schema/CartSchema";
import { OrderMapper } from "../mappers/OrderMapper";

export class OrderService implements OrderDao {

    private dataSource: DataSource;
    private orderMedicineRepository: Repository<OrderMedicineSchema>;
    private orderRepository: Repository<OrderSchema>;
    private orderMapper: OrderMapper;

    constructor() {
        this.dataSource = DatabaseConnection.getInstance().getDataSource();
        this.orderMedicineRepository = this.dataSource.getRepository(OrderMedicineSchema);
        this.orderRepository = this.dataSource.getRepository(OrderSchema);
        this.orderMapper = new OrderMapper();
    }

    public async addNewOrderMedicineItems(userCartItem: CartSchema[], userCode: string, orderMedicineCode: string, transactionCode: string): Promise<OrderMedicineSchema[]> {
        const newOrder = await this.orderMapper.toOrderEntity(orderMedicineCode, userCode, transactionCode);
        await this.orderRepository.save(newOrder);
        const orderMedicines: OrderMedicineSchema[] = await this.orderMapper.toOrderMedicinesEntityArray(userCartItem, orderMedicineCode);
        orderMedicines.forEach((orderItem) => this.orderMedicineRepository.save(orderItem));
        return orderMedicines;
    }

    public async findOrderByOrderMedicineCode(orderMedicineCode: string): Promise<OrderSchema | null> {
        return await this.orderRepository.findOne({
            where: {
                orderMedicineCode: orderMedicineCode
            }
        });
    }

}