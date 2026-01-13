const { syncUser } = require("../middleware/syncUser");
const User = require("../models/User");

jest.mock("../models/User");

describe("syncUser Middleware", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should use existing user", async () => {
    const mockUser = {
      userId: "user123",
      email: "test@example.com",
      balance: 500,
    };

    User.findOne.mockResolvedValue(mockUser);

    const req = { user: { id: "user123", email: "test@example.com" } };
    const res = {};
    const next = jest.fn();

    await syncUser(req, res, next);

    expect(req.dbUser).toBe(mockUser);
    expect(next).toHaveBeenCalled();
  });

  it("should create new user if not exists", async () => {
    const mockNewUser = {
      userId: "newuser",
      email: "new@example.com",
      balance: 1000,
      save: jest.fn().mockResolvedValue(true),
    };

    User.findOne.mockResolvedValue(null);
    User.mockImplementation(() => mockNewUser);

    const req = { user: { id: "newuser", email: "new@example.com" } };
    const res = {};
    const next = jest.fn();

    await syncUser(req, res, next);

    expect(mockNewUser.save).toHaveBeenCalled();
    expect(req.dbUser).toBe(mockNewUser);
    expect(next).toHaveBeenCalled();
  });

  it("should handle database errors", async () => {
    User.findOne.mockRejectedValue(new Error("DB error"));

    const req = { user: { id: "user123" } };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    await syncUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Failed to sync user" });
    expect(next).not.toHaveBeenCalled();
  });
});
