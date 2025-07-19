import express from "express";
import UserRouter from "../routes/UserRouter";
import MedicineRouter from "../routes/MedicineRouter";
import StockRouter from "../routes/StockRouter";
import CartRouter from "../routes/CartRouter";
import OrderRouter from "../routes/OrderRouter";

export class RouterConfig {

    public async initializeRoutes(app: express.Application): Promise<void> {
        app.use("/pp/webapp/api/users", UserRouter);
        app.use("/pp/webapp/api/medicines", MedicineRouter);
        app.use("/pp/webapp/api/stocks", StockRouter);
        app.use("/pp/webapp/api/carts", CartRouter);
        app.use("/pp/webapp/api/orders", OrderRouter);
    }

};