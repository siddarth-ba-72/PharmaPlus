import { Router } from "express";
import { StockController } from "../controllers/StockController";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";

class StockRoutes {

    private router: Router;
    private stockController: StockController;
    private authMiddleware: AuthenticationMiddleware;

    constructor() {
        this.router = Router();
        this.stockController = new StockController();
        this.authMiddleware = new AuthenticationMiddleware();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/modify-stock", this.authMiddleware.authenticateAdmin, this.stockController.modifyStock);
        this.router.get("/medicine-stock/:medicineCode", this.stockController.getMedicineWithStock);
        this.router.get("/all-medicines-stock", this.stockController.getAllMedicinesWithStock);
    }

    public getRouter(): Router {
        return this.router;
    }

}

export default new StockRoutes().getRouter();