const request = require("supertest");
const User = require("../models/User");

jest.mock("../models/User");
jest.mock("../models/Trip");

jest.mock("../middleware/auth", () => ({
  authenticateToken: (req, res, next) => {
    req.user = { id: "user123", email: "test@example.com", role: "user" };
    next();
  },
  requireAdmin: (req, res, next) => {
    next();
  },
}));

jest.mock("../middleware/syncUser", () => ({
  syncUser: (req, res, next) => {
    req.dbUser = {
      userId: "user123",
      email: "test@example.com",
      balance: 500,
      active: true,
      save: jest.fn().mockResolvedValue(true),
    };
    next();
  },
}));

const app = require("../app");

describe("User API", () => {
  const mockUserId = "user123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/users/:id", () => {
    it("should return user information", async () => {
      const mockUser = {
        userId: mockUserId,
        email: "test@example.com",
        balance: 500,
        active: true,
      };

      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .get(`/api/v1/users/${mockUserId}`)
        .expect(200);

      expect(response.body).toHaveProperty("userId", mockUserId);
      expect(response.body).toHaveProperty("email");
      expect(response.body).toHaveProperty("balance");
    });

    it("should return 403 if unauthorized", async () => {
      const response = await request(app)
        .get("/api/v1/users/differnt-user")
        .expect(403);

      expect(response.body).toHaveProperty("error", "Unauthorized");
    });

    describe("GET /api/v1/users/:id/balance", () => {
      it("should return user balance", async () => {
        const response = await request(app)
          .get(`/api/v1/users/${mockUserId}/balance`)
          .expect(200);

        expect(response.body).toHaveProperty("userId", mockUserId);
        expect(response.body).toHaveProperty("balance");
        expect(response.body).toHaveProperty("currency", "SEK");
      });

      it("should return 403 if unauthorized", async () => {
        const response = await request(app)
          .get("/api/v1/users/differnt-user/balance")
          .expect(403);

        expect(response.body).toHaveProperty("error", "Unauthorized");
      });
    });

    describe("POST /api/v1/users/:id/fillup", () => {
      it("should add balance to user account", async () => {
        const response = await request(app)
          .post(`/api/v1/users/${mockUserId}/fillup`)
          .send({ amount: 500 })
          .expect(200);

        expect(response.body).toHaveProperty("message", "Balance updated");
        expect(response.body).toHaveProperty("newBalance", 1000);
        expect(response.body).toHaveProperty("amountAdded", 500);
      });

      it("should return 400 if amount is missing", async () => {
        const response = await request(app)
          .post(`/api/v1/users/${mockUserId}/fillup`)
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty("error");
      });

      it("should return 400 if amount is zero", async () => {
        const response = await request(app)
          .post(`/api/v1/users/${mockUserId}/fillup`)
          .send({ amount: 0 })
          .expect(400);

        expect(response.body).toHaveProperty(
          "error",
          "Amount has to be greater than 0"
        );
      });

      it("should return 403 if unauthorized", async () => {
        const response = await request(app)
          .post("/api/v1/users/${mockUserId}/fillup")
          .send({ amount: 100 })
          .expect(403);

        expect(response.body).toHaveProperty("error", "Unauthorized");
      });
    });
  });
});
