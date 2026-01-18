const request = require("supertest");
const app = require("../app");

describe("Cities API", () => {
  describe("GET /api/v1/cities", () => {
    it("should return 200 OK", async () => {
      const response = await request(app).get("/api/v1/cities").expect(200);

      expect(response.body).toBeDefined();
    });

    it("should return list of cities", async () => {
      const response = await request(app)
        .get('/api/v1/cities')
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("cities");
      expect(Array.isArray(response.body.cities)).toBe(true);
    });

    it("should return cities array", async () => {
      const response = await request(app).get("/api/v1/cities");

      expect(response.body.count).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.body.cities)).toBe(true);
    });
  });
});
