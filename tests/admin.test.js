const request = require("supertest");
const Scooter = require("../models/Scooter");
const Trip = require("../models/Trip");
const User = require("../models/User");
const app = require("../app");

jest.mock("../models/User");
jest.mock("../models/Scooter");
jest.mock("../models/Trip");

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

describe("Admin API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/admin/users", () => {
    it("should return list of users", async () => {
      User.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            userId: "user123",
            email: "test@example.com",
            balance: 100,
            active: true,
          },
        ]),
      });

      const response = await request(app)
        .get("/api/v1/admin/users")
        .expect(200);

      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("users");
    });

    it("should filter users by active status", async () => {
      User.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/admin/users?active=true").expect(200);

      expect(User.find).toHaveBeenCalledWith({ active: true });
    });
  });

  describe("GET /api/v1/admin/scooters", () => {
    it("should return list of scooters", async () => {
      Scooter.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([
          {
            _id: "scooter123",
            name: "SparkRunners#1",
            city: "Stockholm",
            status: "Available",
          },
        ]),
      });

      const response = await request(app)
        .get("/api/v1/admin/scooters")
        .expect(200);

      expect(response.body).toHaveProperty("count");
      expect(response.body).toHaveProperty("scooters");
    });

    it("should filter scooters by city", async () => {
      Scooter.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app)
        .get("/api/v1/admin/scooters?city=Stockholm")
        .expect(200);

      expect(Scooter.find).toHaveBeenCalledWith({ city: "Stockholm" });
    });

    it("should filter scooters by status", async () => {
      Scooter.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app)
        .get("/api/v1/admin/scooters?status=Available")
        .expect(200);

      expect(Scooter.find).toHaveBeenCalledWith({ status: "Available" });
    });
  });
});

// ---------------------------

describe("POST /api/v1/admin/scooters", () => {
  it("should create new scooter", async () => {
    const mockScooter = {
      _id: "scooter123",
      name: "SparkRunners#100",
      city: "Stockholm",
      save: jest.fn().mockResolvedValue(true),
    };

    Scooter.mockImplementation(() => mockScooter);

    const response = await request(app)
      .post("/api/v1/admin/scooters")
      .send({
        name: "SparkRunners#100",
        city: "Stockholm",
        coordinates: { latitude: 59.3327, longitude: 18.0656 },
      })
      .expect(201);

    expect(response.body).toHaveProperty("message", "Scooter created");
    expect(response.body).toHaveProperty("scooter");
  });
});

describe("PUT /api/v1/admin/scooters/:id", () => {
  it("should update scooter", async () => {
    const mockScooter = {
      _id: "scooter123",
      name: "SparkRunners#1",
      battery: 100,
    };

    Scooter.findByIdAndUpdate.mockResolvedValue(mockScooter);

    const response = await request(app)
      .put("/api/v1/admin/scooters/scooter123")
      .send({ battery: 100 })
      .expect(200);

    expect(response.body).toHaveProperty("message", "Scooter updated");
  });

  it("should return 404 if scooter not found", async () => {
    Scooter.findByIdAndUpdate.mockResolvedValue(null);

    const response = await request(app)
      .put("/api/v1/admin/scooters/scooter1000")
      .send({ battery: 100 })
      .expect(404);

    expect(response.body).toHaveProperty("error", "Scooter not found");
  });
});

describe("DELETE /api/v1/admin/scooters/:id", () => {
  it("should delete scooter", async () => {
    const mockScooter = {
      _id: "scooter123",
      name: "SparkRunners#1",
    };

    Scooter.findByIdAndDelete.mockResolvedValue(mockScooter);

    const response = await request(app)
      .delete("/api/v1/admin/scooters/scooter123")
      .expect(200);

    expect(response.body).toHaveProperty("message", "Scooter deleted");
  });

  it("should return 404 if scooter not found", async () => {
    Scooter.findByIdAndDelete.mockResolvedValue(null);

    const response = await request(app)
      .delete("/api/v1/admin/scooters/scooter1000")
      .expect(404);

    expect(response.body).toHaveProperty("error", "Scooter not found");
  });
});

describe("GET /api/v1/admin/rides", () => {
  it("should return list of rides", async () => {
    Trip.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([
            {
              _id: "trip123",
              scooterId: { name: "SparkRunners#1", city: "Stockholm" },
              userId: "user123",
              status: "completed",
            },
          ]),
        }),
      }),
    });

    const response = await request(app).get("/api/v1/admin/rides").expect(200);

    expect(response.body).toHaveProperty("count");
    expect(response.body).toHaveProperty("rides");
  });

  it("should filter rides by status", async () => {
    Trip.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    await request(app).get("/api/v1/admin/rides?status=completed").expect(200);

    expect(Trip.find).toHaveBeenCalledWith({ status: "completed" });
  });
});

describe("GET /api/v1/admin/payments", () => {
  it("should return payment information", async () => {
    Trip.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([
              {
                _id: "trip123",
                scooterId: { name: "SparkRunners#1", city: "Stockholm" },
                userId: "user123",
                startTime: new Date(Date.now() - 60000),
                endTime: new Date(),
                cost: 35,
                status: "completed",
              },
            ]),
          }),
        }),
      }),
    });

    const response = await request(app)
      .get("/api/v1/admin/payments")
      .expect(200);

    expect(response.body).toHaveProperty("count");
    expect(response.body).toHaveProperty("totalIncome");
    expect(response.body).toHaveProperty("payments");
  });

  it("should filter payments by userId", async () => {
    Trip.find.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([]),
          }),
        }),
      }),
    });

    await request(app).get("/api/v1/admin/payments?userId=user123").expect(200);

    expect(Trip.find).toHaveBeenCalledWith({
      status: "completed",
      userId: "user123",
    });
  });
});
