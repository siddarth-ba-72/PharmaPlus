import request from "supertest";
import PharmaPlusApplication from "../PharmaPlusApplication";

describe("PharmaPlusApplication", () => {

    let app: Express.Application;

    beforeAll(() => {
        const appInstance = PharmaPlusApplication;
        app = appInstance.getApp(); // correctly typed
    });

    it("should return 404 for unknown route", async () => {
        const response = await request(app).get("/unknown-route"); // ✅ TS knows app is Express.Application
        expect(response.status).toBe(404);
    });

    it("should have an Express app instance", () => {
        expect(app).toBeDefined();
        expect(app.listen).toBeDefined();
    });

});
