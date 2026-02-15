import { DataSource, Repository } from "typeorm";
import { OrderDao } from "../dao/OrderDao";
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

    public async addNewOrderMedicineItems(userCartItem: CartSchema[], userCode: string, orderMedicineCode: string, transactionCode: string): Promise<OrderMedicineSchema[]> {
        const newOrder = await this.orderMapper.toOrderEntity(orderMedicineCode, userCode, transactionCode);
        await this.orderRepository.save(newOrder);
        const orderMedicines: OrderMedicineSchema[] = await this.orderMapper.toOrderMedicinesEntityArray(userCartItem, orderMedicineCode);
        console.log(orderMedicines);
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

}