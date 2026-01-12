const request = require("supertest");
const jwt = require("jsonwebtoken");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

process.env.JWT_SECRET = "test-secret";

describe("Auth Middleware", () => {
  let validToken;
  let adminToken;
  let expiredToken;

  beforeAll(() => {
    validToken = jwt.sign(
      { id: "user123", email: "user@test.com", role: ["user"] },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );

    adminToken = jwt.sign(
      { id: "admin123", email: "admin@test.com", role: ["admin"] },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );

    expiredToken = jwt.sign(
      { id: "user123", email: "user@test.com", role: ["user"] },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "-1h" }
    );
  });

  describe("authenticateToken", () => {
    it("should call next() with valid token", () => {
      const req = {
        headers: {
          authorization: `Bearer ${validToken}`,
        },
      };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeDefined();
      expect(req.user.id).toBe("user123");
    });

    it("should return 401 without token", () => {
      const req = {
        headers: {},
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Access token required" });
      expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 with invalid token", () => {
      const req = {
        headers: {
          authorization: "Bearer invalid.token.here",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid and expired token",
      });
      expect(next).not.toHaveBeenCalled();
    });

    describe("requireAdmin", () => {
      it("should call next() for admin user", () => {
        const req = {
          user: { id: "admin123", email: "admin@test.com", role: ["admin"] },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it("should return 401 without user", () => {
        const req = {};
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: "Authentication required ",
        });
        expect(next).not.toHaveBeenCalled();
      });

      it("should return 401 for non-admin user", () => {
        const req = {
          user: { id: "user123", email: "user@test.com", role: ["user"] },
        };
        const res = {
          status: jest.fn().mockReturnThis(),
          json: jest.fn(),
        };
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: "Admin access required",
        });
        expect(next).not.toHaveBeenCalled();
      });
    });
  });
});
