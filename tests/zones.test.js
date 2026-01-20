const request = require("supertest");
const app = require("../app");
const Zone = require("../models/Zone");

jest.mock("../models/Zone");

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

describe("Zones API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/zones", () => {
    it("should return 200 OK", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/zones").expect(200);
    });

    it("should return zones structure", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const response = await request(app)
        .get("/api/v1/zones")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("zones");
    });

    it("should filter zones by city", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/zones?city=Stockholm").expect(200);

      expect(Zone.find).toHaveBeenCalledWith({
        city: "Stockholm",
        active: true,
      });
    });

    it("should filter zones by type", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/zones?type=parking").expect(200);

      expect(Zone.find).toHaveBeenCalledWith({
        type: "parking",
        active: true,
      });
    });

    it("should filter zones by both city and type", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app)
        .get("/api/v1/zones?city=Stockholm&type=parking")
        .expect(200);

      expect(Zone.find).toHaveBeenCalledWith({
        city: "Stockholm",
        type: "parking",
        active: true,
      });
    });
  });

  describe("GET /api/v1/zones/check", () => {
    it("should return 200 with zone rules", async () => {
      Zone.find.mockResolvedValue([
        {
          name: "Parking Zone",
          type: "parking",
          rules: {
            parkingAllowed: true,
            ridingAllowed: true,
            maxSpeed: 20,
          },
        },
      ]);

      const response = await request(app)
        .get("/api/v1/zones/check?latitude=59.3327&longitude=18.0656")
        .expect(200);

      expect(response.body).toHaveProperty("inZone");
      expect(response.body).toHaveProperty("rules");
    });

    it("should return 400 if latitude or longitude missing", async () => {
      const response = await request(app)
        .get("/api/v1/zones/check?latitude=59.33")
        .expect(400);

      expect(response.body).toHaveProperty("error");
    });

    it("should return outside zone if no zones found", async () => {
      Zone.find.mockResolvedValue([]);

      const response = await request(app)
        .get("/api/v1/zones/check?latitude=55.0&longitude=10.0")
        .expect(200);

      expect(response.body).toHaveProperty("inZone", false);
      expect(response.body.rules).toHaveProperty("maxSpeed", 0);
    });
  });

  describe("GET /api/v1/zones/:id", () => {
    it("should return zone by id", async () => {
      const mockZone = {
        _id: "zone123",
        name: "Parking Zone - Center",
        type: "parking",
        city: "Stockholm",
        active: true,
      };

      Zone.findById.mockResolvedValue(mockZone);

      const response = await request(app)
        .get("/api/v1/zones/zone123")
        .expect(200);

      expect(response.body.zone).toHaveProperty("_id", "zone123");
      expect(response.body.zone).toHaveProperty("type", "parking");
    });

    it("should return 404 if zone not found", async () => {
      Zone.findById.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/zones/zone1000")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Zone not found");
    });
  });

  describe("POST /api/v1/zones (Admin)", () => {
    it("should create new zone", async () => {
      const mockZone = {
        _id: "zone123",
        name: "New Zone",
        type: "parking",
        city: "Stockholm",
        save: jest.fn().mockResolvedValue(true),
      };

      Zone.mockImplementation(() => mockZone);

      const response = await request(app)
        .post("/api/v1/zones")
        .send({
          name: "New Zone",
          type: "parking",
          city: "Stockholm",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [18.070913274959253, 59.34555985237665],
                [18.070913274959253, 59.343016493193375],
                [18.07519509114431, 59.343016493193375],
                [18.07519509114431, 59.34555985237665],
                [18.070913274959253, 59.34555985237665],
              ],
            ],
          },
        })
        .expect(201);

      expect(response.body).toHaveProperty("message", "Zone created");
    });
  });

  describe("PUT /api/v1/zones/:id (Admin)", () => {
    it("should return 404 if zone not found", async () => {
      Zone.findById.mockResolvedValue(null);

      const response = await request(app)
        .put("/api/v1/zones/zone999")
        .send({ name: "Updated" })
        .expect(404);
      expect(response.body).toHaveProperty("error", "Zone not found");
    });
  });

  describe("DELETE /api/v1/zones/:id (Admin)", () => {
    it("should delete zone", async () => {
      const mockZone = {
        _id: "zone123",
        name: "Zone to delete",
      };

      Zone.findByIdAndDelete.mockResolvedValue(mockZone);

      const response = await request(app)
        .delete("/api/v1/zones/zone123")
        .expect(200);

      expect(response.body).toHaveProperty("message", "Zone deleted");
    });

    it("should return 404 if zone not found", async () => {
      Zone.findByIdAndDelete.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/v1/zones/zone1000")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Zone not found");
    });
  });
});

describe("Zone Rules Validation", () => {
  describe("No-go zones", () => {
    it("should not allow riding in no-go zones", async () => {
      const mockNoGoZone = {
        name: "No-Go Humlegården",
        type: "no-go",
        city: "Stockholm",
        rules: {
          parkingAllowed: false,
          ridingAllowed: false,
          maxSpeed: 0,
        },
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [18.070181561995554, 59.34063840775448],
              [18.070181561995554, 59.33839903042323],
              [18.074691922062385, 59.33839903042323],
              [18.074691922062385, 59.34063840775448],
              [18.070181561995554, 59.34063840775448],
            ],
          ],
        },
      };

      Zone.find.mockResolvedValue([mockNoGoZone]);

      const response = await request(app)
        .get("/api/v1/zones/check?latitude=59.33951&longitude=18.07244")
        .expect(200);

      expect(response.body.rules.rideAllowed).toBe(false);
      expect(response.body.rules.maxSpeed).toBe(0);
      expect(response.body.rules.parkAllowed).toBe(false);
    });

    it("should not allow parking in no-go zones", async () => {
      const mockNoGoZone = {
        name: "No-Go – Humlegården",
        type: "no-go",
        city: "Stockholm",
        rules: {
          parkingAllowed: false,
          ridingAllowed: false,
          maxSpeed: 0,
        },
      };

      Zone.find.mockResolvedValue([mockNoGoZone]);

      const response = await request(app)
        .get("/api/v1/zones/check?latitude=59.33951&longitude=18.07244")
        .expect(200);

      expect(response.body.rules.parkAllowed).toBe(false);
    });

    it("should return all no-go zones when filtered by type", async () => {
      const mockNoGoZone = [
        {
          name: "No-Go – Humlegården",
          type: "no-go",
          city: "Stockholm",
          rules: {
            parkingAllowed: false,
            ridingAllowed: false,
            maxSpeed: 0,
          },
        },
      ];

      Zone.find.mockReturnValue(mockNoGoZone);

      const response = await request(app)
        .get("/api/v1/zones?type=no-go")
        .expect(200);

      expect(response.body.count).toBeGreaterThan(0);
      response.body.zones.forEach((zone) => {
        expect(zone.type).toBe("no-go");
        expect(zone.rules.ridingAllowed).toBe(false);
        expect(zone.rules.parkingAllowed).toBe(false);
        expect(zone.rules.maxSpeed).toBe(0);
      });
    });
  });

  describe("Parking zones", () => {
    it("should allow both riding and parking in parking zones", async () => {
      const mockParkingZone = {
        name: "Parking Center",
        type: "parking",
        city: "Stockholm",
        rules: {
          parkingAllowed: true,
          ridingAllowed: true,
          maxSpeed: 20,
        },
      };

      Zone.find.mockResolvedValue([mockParkingZone]);

      const response = await request(app)
        .get("/api/v1/zones/check?latitude=59.33688&longitude=18.06352")
        .expect(200);

      expect(response.body.rules.rideAllowed).toBe(true);
      expect(response.body.rules.parkAllowed).toBe(true);
    });
  });

  describe("Slow-speed zones", () => {
    it("should allow riding but enforce speed limit in slow-speed zones", async () => {
      const mockSlowZone = {
        name: "Slow Speed City Center",
        type: "slow-speed",
        city: "Stockholm",
        rules: {
          ridingAllowed: true,
          maxSpeed: 10,
        },
      };

      Zone.find.mockResolvedValue([mockSlowZone]);

      const response = await request(app)
        .get("/api/v1/zones/check?latitude=59.33625&longitude=18.0635")
        .expect(200);

      expect(response.body.rules.rideAllowed).toBe(true);
      expect(response.body.rules.maxSpeed).toBe(10);
    });
  });
});
