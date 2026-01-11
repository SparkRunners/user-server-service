const request = require("supertest");
const app = require("../app");
const Scooter = require("../models/Scooter");

jest.mock("../models/Scooter");

describe("Scooters API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/scooters", () => {
    it("should return 200 OK", async () => {
      Scooter.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/scooters").expect(200);
    });

    it("should filter scooters by city", async () => {
      Scooter.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/scooters?city=Stockholm").expect(200);

      expect(Scooter.find).toHaveBeenCalledWith({ city: "Stockholm" });
    });

    it("should filter scooters by status", async () => {
      Scooter.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/scooters?status=Available").expect(200);

      expect(Scooter.find).toHaveBeenCalledWith({ status: "Available" });
    });

    it("should filter by both city and status", async () => {
      Scooter.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app)
        .get("/api/v1/scooters?city=Stockholm&status=Available")
        .expect(200);

      expect(Scooter.find).toHaveBeenCalledWith({
        city: "Stockholm",
        status: "Available",
      });
    });
  });

  describe("GET /api/v1/scooters/:id", () => {
    it("should return scooter by id", async () => {
      const mockScooter = {
        _id: "123",
        name: "SparkRunners#1",
        city: "Stockholm",
        coordinates: {
          longitude: 18.0686,
          latitude: 59.3293,
        },
        battery: 78,
        speed: 0,
        status: "Available",
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      const response = await request(app)
        .get("/api/v1/scooters/123")
        .expect(200);

      expect(response.body).toHaveProperty("_id", "123");
      expect(response.body).toHaveProperty("name", "SparkRunners#1");
    });

    it("should return 404 if scooter not found", async () => {
      Scooter.findById.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/scooters/1000")
        .expect(404);

      expect(response.body).toHaveProperty("error");
    });

    it("should handle database errors", async () => {
      Scooter.findById.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/api/v1/scooters/123")
        .expect(500);

      expect(response.body).toHaveProperty("error");
    });
  });
});
