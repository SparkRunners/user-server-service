const request = require("supertest");
const { getScooters } = require("../utils/simulation");

const app = require("../app");

describe("Simulation API", () => {
    describe("POST /api/v1/simulation/start", () => {
        it("should start simulation", async () => {
            const response = await request(app)
                .post("/api/v1/simulation/start")
                .expect(200);

            expect(response.body).toHaveProperty("message", "Simulation started");
        });
    });

    describe("POST /api/v1/simulation/stop", () => {
        it("should stop simulation", async () => {
            const response = await request(app)
                .post("/api/v1/simulation/stop")
                .expect(200);

            expect(response.body).toHaveProperty("message", "Simulation stopped");
        });
    });


    describe("GET /api/v1/simulation/state", () => {
        it("should return simulation state", async () => {
            const response = await request(app)
                .get("/api/v1/simulation/state")
                .expect(200);

            expect(response.body).toHaveProperty("count");
            expect(response.body).toHaveProperty("scooters");
        });
    });



    
})