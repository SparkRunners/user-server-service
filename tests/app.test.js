process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");

describe("app.js smoke", () => {
    it("serves swagger or base route", async () => {
        const res = await request(app).get("/api-docs");
        expect([200, 301, 302, 404]).toContain(res.status)
    });

    it("has /api/v1 mounted (pricing)", async () => {
        const res = await request(app).get("/api/v1/pricing");
        expect([200, 401, 403, 403]).toContain(res.status);
    });
});