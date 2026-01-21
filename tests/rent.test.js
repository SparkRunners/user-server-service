const request = require("supertest");
const Scooter = require("../models/Scooter");
const Trip = require("../models/Trip");
const User = require("../models/User");
const Zone = require("../models/Zone");
const jwt = require("jsonwebtoken");

jest.mock("../models/Scooter");
jest.mock("../models/Trip");
jest.mock("../models/Zone");
jest.mock("../models/User");

jest.mock("../middleware/auth", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "user123", email: "test@example.com", role: "user" };
    next();
  },
  requireAdmin: (req, res, next) => {
    next();
  },
}));

const app = require("../app");

describe("Rent API", () => {
  let token;
  const mockUserId = "user123";

  beforeAll(() => {
    token = jwt.sign(
      { id: mockUserId, email: "test@example.com", role: "user" },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" },
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/rent/start/:id", () => {
    it("should start a trip successfully", async () => {
      const mockScooter = {
        _id: "scooter123",
        name: "SparkRunners#1",
        city: "Stockholm",
        coordinates: {
          longitude: 18.0686,
          latitude: 59.3293,
        },
        battery: 80,
        speed: 0,
        status: "Available",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUser = {
        userId: mockUserId,
        balance: 1000,
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTrip = {
        _id: "trip123",
        scooterId: "scooter123",
        userId: mockUserId,
        startTime: new Date(),
        status: "active",
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);
      User.findOne.mockResolvedValue(mockUser);
      Trip.mockImplementation(() => mockTrip);

      const response = await request(app)
        .post("/api/v1/rent/start/scooter123")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Trip started");
      expect(response.body).toHaveProperty("trip");
      expect(response.body).toHaveProperty("scooter");
    });

    it("should return 404 if scooter not found", async () => {
      Scooter.findById.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/rent/start/scooter123")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty("error", "Scooter not found");
    });

    it("should return 400 if scooter not available", async () => {
      const mockScooter = {
        _id: "scooter123",
        status: "In use",
      };

      Scooter.findById.mockResolvedValue(mockScooter);

      const response = await request(app)
        .post("/api/v1/rent/start/scooter123")
        .set("Authorization", `Bearer ${token}`)
        .expect(400);

      expect(response.body).toHaveProperty("error", "Scooter is not available");
    });

    it("should return 400 if insufficient balance", async () => {
      const mockScooter = {
        _id: "scooter123",
        status: "Available",
      };

      const mockUser = {
        userId: mockUserId,
        balance: 5,
      };

      Scooter.findById.mockResolvedValue(mockScooter);
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/rent/start/scooter123")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Insufficient balance");
    });

    it("should handle database errors on start", async () => {
      Scooter.findById.mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/v1/rent/start/scooter123")
        .expect(500);

      expect(response.body).toHaveProperty("error");
    });
  });

  describe("POST /api/v1/rent/stop/:id", () => {
    it("should stop a trip successfully", async () => {
      const mockScooter = {
        _id: "scooter123",
        name: "SparkRunners#1",
        city: "Stockholm",
        coordinates: {
          longitude: 20.0686,
          latitude: 59.4293,
        },
        status: "In use",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTrip = {
        _id: "trip123",
        scooterId: "scooter123",
        userId: mockUserId,
        startTime: new Date(Date.now() - 600000),
        status: "active",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUser = {
        userId: mockUserId,
        balance: 1000,
        save: jest.fn().mockResolvedValue(true),
      };

      Zone.find.mockResolvedValue([]);

      Scooter.findById.mockResolvedValue(mockScooter);
      Trip.findOne.mockResolvedValue(mockTrip);
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/rent/stop/scooter123")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("message", "Trip stopped");
      expect(response.body.trip).toHaveProperty("cost");
    });

    it("should return 404 if no active trip found", async () => {
      const mockScooter = {
        _id: "scooter123",
        status: "In use",
      };

      const mockUser = {
        userId: mockUserId,
        balance: 1000,
      };

      Scooter.findById.mockResolvedValue(mockScooter);
      Trip.findOne.mockResolvedValue(null);
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/rent/stop/scooter123")
        .set("Authorization", `Bearer ${token}`)
        .expect(404);

      expect(response.body).toHaveProperty(
        "error",
        "No active trip for scooter",
      );
    });

    it("should return 404 if scooter not found on stop", async () => {
      Scooter.findById.mockResolvedValue(null);

      const response = await request(app)
        .post("/api/v1/rent/stop/scooter1000")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Scooter not found");
    });

    it("should return 400 if insufficient balance for trip cost", async () => {
      const mockScooter = {
        _id: "scooter123",
        name: "SparkRunners#1",
        city: "Stockholm",
        coordinates: { latitude: 60.45, longitude: 20.11 },
        status: "In use",
        save: jest.fn().mockReSolvedValue,
      };

      const mockTrip = {
        _id: "trip123",
        scooterId: "scooter123",
        userId: mockUserId,
        startTime: new Date(Date.now() - 6000000),
        status: "active",
        cost: 0,
        endTime: null,
        startPosition: {
          city: "Stockholm",
          coordinates: { latitude: 60.45, longitude: 20.11 },
        },
        endPosition: {
          city: "Stockholm",
          coordinates: { latitude: 60.45, longitude: 20.11 },
        },
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUser = {
        userId: mockUserId,
        balance: 5,
        save: jest.fn().mockResolvedValue(true),
      };

      Scooter.findById.mockResolvedValue(mockScooter);
      Trip.findOne.mockResolvedValue(mockTrip);
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/rent/stop/scooter123")
        .expect(400);

      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("Balance is insufficient");
    });
  });

  describe("GET /api/v1/rent/history", () => {
    it("should return trip history", async () => {
      Trip.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      });

      const response = await request(app)
        .get("/api/v1/rent/history")
        .expect(200);

      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("trips");
    });
  });

  describe("Parking Fee Calculation", () => {
    it("should charge parking fee for free parking", async () => {
      const mockScooter = {
        _id: "scooter123",
        name: "SparkRunners#21",
        city: "Stockholm",
        coordinates: { longitude: 18.0623, latitude: 59.3341 },
        status: "In use",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockTrip = {
        _id: "trip123",
        scooterId: "scooter123",
        userId: mockUserId,
        startTime: new Date(Date.now() - 60000),
        status: "active",
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUser = {
        userId: mockUserId,
        balance: 1000,
        save: jest.fn().mockResolvedValue(true),
      };

      Zone.find.mockResolvedValue([
        {
          type: "city",
          rules: { parkingAllowed: true, ridingAllowed: true },
        },
      ]);

      Scooter.findById.mockResolvedValue(mockScooter);
      Trip.findOne.mockResolvedValue(mockTrip);
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post("/api/v1/rent/stop/scooter123")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body.trip.parkingType).toBe("free");
      expect(response.body.trip.parkingFee).toBe("15 kr");
    });
  });
});
