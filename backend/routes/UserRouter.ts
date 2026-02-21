import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";

class UserRoutes {

    private router: Router;
    private userController: UserController;
    private authMiddleware: AuthenticationMiddleware;

    constructor() {
        this.router = Router();
        this.userController = new UserController();
        this.authMiddleware = new AuthenticationMiddleware();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post("/create-user", this.userController.registerUser);
        this.router.post("/login-user", this.userController.loginUser);
        this.router.get("/logout", this.authMiddleware.authenticate, this.userController.logOutUser);
        this.router.get("/all-users", this.authMiddleware.authenticateAdmin, this.userController.getAllUsers);
        this.router.get("/current-user", this.userController.getCurrentUser);
        this.router.put("/update-user", this.authMiddleware.authenticate, this.userController.updateUserDetails);
        this.router.put("/change-password", this.authMiddleware.authenticate, this.userController.updateUserPassword);
        this.router.get("/forgot-password", this.authMiddleware.checkIsNotLoggedIn, this.userController.forgotPassword);
        this.router.put("/reset-password", this.authMiddleware.checkIsNotLoggedIn, this.authMiddleware.checkResetToken, this.userController.resetPassword);
    }

    public getRouter(): Router {
        return this.router;
    }

}

export default new UserRoutes().getRouter();
