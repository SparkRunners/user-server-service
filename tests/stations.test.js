const request = require("supertest");
const app = require("../app");
const Zone = require("../models/Zone");

jest.mock("../models/Zone");

describe("Stations API", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/stations", () => {
    it("should return 200 OK", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/stations").expect(200);
    });

    it("should return stations structure", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      const response = await request(app)
        .get("/api/v1/stations")
        .expect(200)
        .expect("Content-Type", /json/);

      expect(response.body).toHaveProperty("stations");
    });

    it("should filter stations by city", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/stations?city=Stockholm").expect(200);

      expect(Zone.find).toHaveBeenCalledWith({
        type: "charging",
        city: "Stockholm",
        active: true,
      });
    });

    it("should only return charging zones", async () => {
      Zone.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue([]),
      });

      await request(app).get("/api/v1/stations").expect(200);

      expect(Zone.find).toHaveBeenCalledWith({
        type: "charging",
        active: true,
      });
    });
  });

  describe("GET /api/v1/stations/:id", () => {
    it("should return 404 if station not found", async () => {
      Zone.findById.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/v1/stations/station1000")
        .expect(404);

      expect(response.body).toHaveProperty("error", "Station not found");
    });
  });
});
