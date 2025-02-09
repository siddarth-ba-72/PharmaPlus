import { Router } from "express";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";
import { MedicineController } from "../controllers/MedicineController";

class MedicineRoutes {

    private router: Router;
    private medicineController: MedicineController;
    private authMiddleware: AuthenticationMiddleware;

    constructor() {
        this.router = Router();
        this.medicineController = new MedicineController();
        this.authMiddleware = new AuthenticationMiddleware();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get("/all-medicines", this.medicineController.getAllMedicines);
        this.router.post("/save-medicine", this.authMiddleware.authenticateAdmin, this.medicineController.addMedicine);
        this.router.put("/update-medicine", this.authMiddleware.authenticateAdmin, this.medicineController.updateMedicine);
        this.router.delete("/delete-medicine", this.authMiddleware.authenticateAdmin, this.medicineController.deleteMedicine);
    }

    public getRouter(): Router {
        return this.router;
    }

}

export default new MedicineRoutes().getRouter();