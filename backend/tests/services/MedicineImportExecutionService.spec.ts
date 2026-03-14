import { BadRequestException } from "../../exceptions/CustomExceptions";
import { MedicineImportService } from "../../services/MedicineImportService";

describe("MedicineImportService execution controls", () => {
    it("queues a review-required job on approve", async () => {
        const service = new MedicineImportService();
        const job = {
            jobId: "job-1",
            state: "REVIEW_REQUIRED",
            validRows: 2,
            cancelRequested: false,
            approvedAt: null,
            startedAt: null,
            finishedAt: null,
        } as any;

        const findByJobId = jest.fn().mockResolvedValue(job);
        const updateJob = jest.fn().mockImplementation(async (payload: any) => payload);
        const executeQueuedJob = jest.fn().mockResolvedValue(undefined);

        (service as any).jobRepository = { findByJobId, updateJob };
        (service as any).executeQueuedJob = executeQueuedJob;

        const result = await service.approveAndStartExecution("job-1");

        expect(findByJobId).toHaveBeenCalledWith("job-1");
        expect(updateJob).toHaveBeenCalled();
        expect(result.state).toBe("QUEUED");
        expect(result.message).toContain("started");
    });

    it("rejects cancel when job is not running", async () => {
        const service = new MedicineImportService();
        const findByJobId = jest.fn().mockResolvedValue({
            jobId: "job-2",
            state: "SUCCEEDED",
        });

        (service as any).jobRepository = { findByJobId };

        await expect(service.cancelJobExecution("job-2")).rejects.toBeInstanceOf(BadRequestException);
    });

    it("resets retryable rows and marks job retrying", async () => {
        const service = new MedicineImportService();
        const job = {
            jobId: "job-3",
            state: "PARTIAL_SUCCESS",
            cancelRequested: true,
            finishedAt: new Date(),
        } as any;

        const findByJobId = jest.fn().mockResolvedValue(job);
        const updateJob = jest.fn().mockImplementation(async (payload: any) => payload);
        const resetRowsForRetry = jest.fn().mockResolvedValue(undefined);
        const executeQueuedJob = jest.fn().mockResolvedValue(undefined);

        (service as any).jobRepository = { findByJobId, updateJob };
        (service as any).rowRepository = { resetRowsForRetry };
        (service as any).executeQueuedJob = executeQueuedJob;

        const result = await service.retryFailedRows("job-3", "FAILED_RETRYABLE");

        expect(resetRowsForRetry).toHaveBeenCalledWith("job-3", "FAILED_RETRYABLE");
        expect(updateJob).toHaveBeenCalled();
        expect(result.state).toBe("RETRYING");
    });
});
