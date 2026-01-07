const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");
const { syncUser } = require('../middleware/syncUser');

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user information
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: User ID
 *     responses:
 *       200:
 *         description: User info
 *       400:
 *         description: User not found
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Scooter not found
 */
router.get("/users/:id", authenticateToken, syncUser, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = req.dbUser;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      userId: user.userId,
      email: user.email,
      name: user.name,
      balance: user.balance,
      active: user.active,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/users/{id}/balance:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user information
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: User ID
 *     responses:
 *       200:
 *         description: User info
 *       400:
 *         description: User not found
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Scooter not found
 */
router.get("/users/:id/balance", authenticateToken, syncUser, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const user = req.dbUser;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      userId: user.userId,
      balance: user.balance,
      currency: "SEK",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/**
 * @swagger
 * /api/v1/users/{id}/fillup:
 *   post:
 *     tags:
 *       - Users
 *     summary: Add money to users balance
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *      required: true
 *      content:
 *          application/json:
 *             schema:
 *              type: object
 *              properties:
 *                  amount:
 *                    type: number
 *                    minimum: 1
 *     responses:
 *       200:
 *         description: Balance updated
 *       400:
 *         description: Amount invalid
 *       401:
 *         description: Unauthorized
 */
router.post("/users/:id/fillup", authenticateToken, syncUser, async (req, res) => {
  try {
    if (req.user.id !== req.params.id && req.user.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const { amount } = req.body;

    if (amount <= 0 || !amount) {
      return res.status(400).json({ error: "Amount has to be greater than 0" });
    }

    const user = req.dbUser;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.balance += amount;
    await user.save();

    res.json({
      message: "Balance updated",
      userId: user.userId,
      newBalance: user.balance,
      amountAdded: amount,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
