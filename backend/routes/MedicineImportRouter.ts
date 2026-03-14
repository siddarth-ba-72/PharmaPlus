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

        this.router.patch(
            "/jobs/:jobId/rows/:rowNumber",
            this.authMiddleware.authenticateAdmin,
            this.medicineImportController.updateJobRow
        );

        this.router.post(
            "/jobs/:jobId/approve",
            this.authMiddleware.authenticateAdmin,
            this.medicineImportController.approveAndStartExecution
        );

        this.router.post(
            "/jobs/:jobId/cancel",
            this.authMiddleware.authenticateAdmin,
            this.medicineImportController.cancelExecution
        );

        this.router.post(
            "/jobs/:jobId/retry-failed",
            this.authMiddleware.authenticateAdmin,
            this.medicineImportController.retryFailedRows
        );
    }

    public getRouter(): Router {
        return this.router;
    }

}

export default new MedicineImportRoutes().getRouter();
