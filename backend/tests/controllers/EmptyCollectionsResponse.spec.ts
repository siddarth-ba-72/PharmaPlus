import { MedicineController } from "../../controllers/MedicineController";
import { StockController } from "../../controllers/StockController";

describe("Empty collection responses", () => {
  it("returns an empty medicines list with success response instead of no-content", async () => {
    const controller = new MedicineController();
    const httpResponse = {
      sendHttpResponse: jest.fn()
    };

    (controller as any).medicineService = {
      fetchAllMedicines: jest.fn().mockResolvedValue([])
    };
    (controller as any).httpResponse = httpResponse;

    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    controller.getAllMedicines(req, res, next);

    await Promise.resolve();

    expect(httpResponse.sendHttpResponse).toHaveBeenCalledWith(
      res,
      expect.any(Number),
      expect.objectContaining({ medicines: [] })
    );
    expect(httpResponse.sendHttpResponse.mock.calls[0][1]).not.toBe(204);
  });

  it("returns an empty stock list with success response instead of no-content", async () => {
    const controller = new StockController();
    const httpResponse = {
      sendHttpResponse: jest.fn()
    };

    (controller as any).stockService = {
      fetchAllMedicinesWithStock: jest.fn().mockResolvedValue([])
    };
    (controller as any).httpResponse = httpResponse;

    const req = {} as any;
    const res = {} as any;
    const next = jest.fn();

    controller.getAllMedicinesWithStock(req, res, next);

    await Promise.resolve();

    expect(httpResponse.sendHttpResponse).toHaveBeenCalledWith(
      res,
      expect.any(Number),
      expect.objectContaining({ medicineStocks: [] })
    );
    expect(httpResponse.sendHttpResponse.mock.calls[0][1]).not.toBe(204);
  });
});
