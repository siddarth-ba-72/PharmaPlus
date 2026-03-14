import { Router } from "express";
import multer from "multer";
import { AuthenticationMiddleware } from "../middlewares/AuthenticationMiddleware";
import { MedicineImportController } from "../controllers/MedicineImportController";

class MedicineImportRoutes {

    private router: Router;
    private authMiddleware: AuthenticationMiddleware;
    private medicineImportController: MedicineImportController;
    private uploadMiddleware: multer.Multer;

    constructor() {
        this.router = Router();
        this.authMiddleware = new AuthenticationMiddleware();
        this.medicineImportController = new MedicineImportController();
        this.uploadMiddleware = multer({
            storage: multer.memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024
            }
        });
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post(
            "/uploads",
            this.authMiddleware.authenticateAdmin,
            this.medicineImportController.createUploadSession
        );

        this.router.post(
            "/uploads/:uploadId/complete",
            this.authMiddleware.authenticateAdmin,
            this.uploadMiddleware.single("file"),
            this.medicineImportController.completeUpload
        );

        this.router.post(
            "/jobs",
            this.authMiddleware.authenticateAdmin,
            this.medicineImportController.createPreviewJob
        );

        this.router.get(
            "/jobs/:jobId",
            this.authMiddleware.authenticateAdmin,
            this.medicineImportController.getJobSummary
        );

        this.router.get(
            "/jobs/:jobId/rows",
            this.authMiddleware.authenticateAdmin,
            this.medicineImportController.getJobRows
        );
    }

    public getRouter(): Router {
        return this.router;
    }

}

export default new MedicineImportRoutes().getRouter();
