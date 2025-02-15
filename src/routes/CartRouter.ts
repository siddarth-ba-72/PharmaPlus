import { Router } from "express";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";
import { CartController } from "../controllers/CartController";

class CartRoutes {

    private router: Router;
    private cartController: CartController;
    private authMiddleware: AuthenticationMiddleware;

    constructor() {
        this.router = Router();
        this.cartController = new CartController();
        this.authMiddleware = new AuthenticationMiddleware();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/modify-cart", this.authMiddleware.authenticate, this.cartController.modifyUserCart);
        this.router.get("/user-cart", this.authMiddleware.authenticate, this.cartController.getUserCart);
    }

    public getRouter(): Router {
        return this.router;
    }

}

export default new CartRoutes().getRouter();