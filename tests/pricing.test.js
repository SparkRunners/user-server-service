const request = require("supertest");
const app = require("../app");

describe("Pricing API", () => {
  describe("GET /api/v1/pricing", () => {
    it("should return 200 OK", async () => {
      await request(app).get("/api/v1/pricing").expect(200);
    });

    it("should return pricing information", async () => {
      const response = await request(app)
        .get("/api/v1/pricing")
        .expect("Content-Type", /json/);

        expect(response.body).toHaveProperty("startFee");
        expect(response.body).toHaveProperty("perMinute");
        expect(response.body).toHaveProperty("description");
        expect(response.body).toHaveProperty("currency");
    });
  });
});
