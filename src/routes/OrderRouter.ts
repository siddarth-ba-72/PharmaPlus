import { Router } from "express";
import { OrderController } from "../controllers/OrderController";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";


class OrderRoutes {

    private router: Router;
    private orderController: OrderController;
    private authMiddleware: AuthenticationMiddleware;

    constructor() {
        this.router = Router();
        this.orderController = new OrderController();
        this.authMiddleware = new AuthenticationMiddleware();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/new-order", this.authMiddleware.authenticate, this.orderController.orderItems);
    }

    public getRouter(): Router {
        return this.router;
    }

}

export default new OrderRoutes().getRouter();