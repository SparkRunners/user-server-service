const request = require("supertest");
const Scooter = require("../models/Scooter");

jest.mock("../models/Scooter");

jest.mock("../middleware/auth", () => ({
  authenticateToken: (req, res, next) => {
    req.user = {
      id: "user123",
      email: "test@example.com",
      role: "user",
    };
    next();
  },
  requireAdmin: (req, res, next) => {
    next();
  },
}));

const app = require("../app");

describe("Telemetry API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/scooters/:id/telemetry", () => {
    it("should update scooter telemetry data", async () => {
      const mockScooter = {
        _id: "scooter123",
        name: "SparkRunners#1",
        city: "Stockholm",
        coordinates: {
          latitude: 59.3327,
          longitude: 18.0656,
        },
        battery: 80,
        speed: 15,
        status: "In use",
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      const response = await request(app)
        .post("/api/v1/scooters/scooter123/telemetry")
        .send({
          coordinates: { latitude: 60.3327, longitude: 19.0656 },
          battery: 75,
          speed: 20,
        })
        .expect(200);

      expect(response.body).toHaveProperty("message", "Telemetry updated");
      expect(mockScooter.save).toHaveBeenCalled();
    });

    it("should return 404 if scooter is not found", async () => {
      Scooter.findById.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/scooters/scooter1000/telemetry")
        .send({
          coordinates: { latitude: 60.3327, longitude: 19.0656 },
          battery: 75,
        })
        .expect(404);

      expect(response.body).toHaveProperty("error", "Scooter not found");
    });

    it("should update only provided fields", async () => {
      const mockScooter = {
        _id: "scooter123",
        coordinates: {
          latitude: 59.3327,
          longitude: 18.0656,
        },
        battery: 80,
        speed: 15,
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      await request(app)
        .post("/api/v1/scooters/scooter123/telemetry")
        .send({ battery: 65 })
        .expect(200);

      expect(mockScooter.battery).toBe(65);
      expect(mockScooter.save).toHaveBeenCalled();
    });

    it("should update coordinates if provided", async () => {
      const mockScooter = {
        _id: "scooter123",
        coordinates: { latitude: 59.3327, longitude: 18.0656 },
        battery: 80,
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      const response = await request(app)
        .post("/api/v1/scooters/scooter123/telemetry")
        .send({
          coordinates: { latitude: 60.3327, longitude: 19.0656 },
        })
        .expect(200);

      expect(mockScooter.coordinates.latitude).toBe(60.3327);
      expect(mockScooter.coordinates.longitude).toBe(19.0656);
      expect(response.body).toBeDefined();
    });

    it("should update speed if provided", async () => {
      const mockScooter = {
        _id: "scooter123",
        speed: 15,
        battery: 75,
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      await request(app)
        .post("/api/v1/scooters/scooter123/telemetry")
        .send({ speed: 20 })
        .expect(200);

      expect(mockScooter.speed).toBe(20);
    });

    it("should update only status", async () => {
      const mockScooter = {
        _id: "scooter123",
        status: "In use",
        speed: 15,
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      await request(app)
        .post("/api/v1/scooters/scooter123/telemetry")
        .send({ status: "Available" })
        .expect(200);

      expect(mockScooter.status).toBe("Available");
    });

    it("should update only battery", async () => {
      const mockScooter = {
        _id: "scooter123",
        coordinates: { latitude: 59.3327, longitude: 18.0656 },
        speed: 15,
        battery: 75,
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      await request(app)
        .post("/api/v1/scooters/scooter123/telemetry")
        .send({ battery: 70 })
        .expect(200);

      expect(mockScooter.battery).toBe(70);
      expect(mockScooter.save).toHaveBeenCalled();
    });

    it("should update only coordinates", async () => {
      const mockScooter = {
        _id: "scooter123",
        coordinates: { latitude: 59.3327, longitude: 18.0656 },
        speed: 15,
        battery: 75,
        city: "Stockholm",
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      await request(app)
        .post("/api/v1/scooters/scooter123/telemetry")
        .send({ coordinates: { latitude: 60.3327, longitude: 19.0656 } })
        .expect(200);

      expect(mockScooter.coordinates.latitude).toBe(60.3327);
      expect(mockScooter.coordinates.longitude).toBe(19.0656);
    });

    it("should handle database errors", async () => {
      Scooter.findById.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/v1/scooters/scooter123/telemetry")
        .send({ battery: 55 })
        .expect(500);

      expect(response.body).toHaveProperty("error");
    });
  });
});
