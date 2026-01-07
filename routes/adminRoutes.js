const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Scooter = require("../models/Scooter");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const Trip = require("../models/Trip");

/**
 * @swagger
 * /api/v1/admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all users (admin only)
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: active
 *        schema:
 *          type: boolean
 *        description: Filter by active status
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access, only Admin
 */
router.get(
  "/admin/users",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { active } = req.query;
      const filter = {};

      if (active !== undefined) {
        filter.active = active === "true";
      }

      const users = await User.find(filter).sort({ createdAt: -1 });

      res.json({
        count: users.length,
        users: users,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/scooters:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all scooters (admin only)
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: city
 *        schema:
 *          type: string
 *      - in: query
 *        name: status
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: List of scooters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access, only Admin
 */
router.get(
  "/admin/scooters",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { city, status } = req.query;
      const filter = {};

      if (city) filter.city = city;
      if (status) filter.status = status;

      const scooters = await Scooter.find(filter).sort({ createdAt: -1 });

      res.json({
        count: scooters.length,
        scooters: scooters,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/scooters:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Create new scooter (admin only)
 *     security:
 *      - bearerAuth: []
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *          type: object
 *          required:
 *             - name
 *             - city
 *             - coordinates
 *          properties:
 *             name:
 *               type: string
 *             city:
 *               type: string
 *             coordinates:
 *               type: object
 *               properties:
 *                  latitude:
 *                    type: number
 *                  longitude:
 *                    type: number
 *             battery:
 *               type: number
 *             status:
 *               type: string
 *     responses:
 *       201:
 *         description: Scooter created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access, only Admin
 */
router.post(
  "/admin/scooters",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const scooter = new Scooter({
        name: req.body.name,
        city: req.body.city,
        coordinates: req.body.coordinates,
        battery: req.body.battery || 100,
        speed: 0,
        status: req.body.status || "Available",
      });

      await scooter.save();

      res.status(201).json({
        message: "Scooter created",
        scooter: scooter,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/scooters/{id}:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Update scooter (admin only)
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Scooter ID
 *     requestBody:
 *      required: true
 *      content:
 *       application/json:
 *        schema:
 *          type: object
 *          properties:
 *            name:
 *              type: string
 *            city:
 *              type: string
 *            coordinates:
 *              type: object
 *              properties:
 *                latitude:
 *                  type: number
 *                longitude:
 *                  type: number
 *            battery:
 *              type: number
 *              minimum: 0
 *              maximum: 100
 *            speed:
 *              type: number
 *              minimum: 0
 *            status:
 *              type: string
 *              enum: [Available, In use, Charging, Maintenance, Off]
 *     responses:
 *       200:
 *         description: Scooter updated
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access, only Admin
 *       404:
 *         description: Scooter not found
 */
router.put(
  "/admin/scooters/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const updateData = {};

      if (req.body.name) updateData.name = req.body.name;
      if (req.body.city) updateData.city = req.body.city;
      if (req.body.coordinates) updateData.coordinates = req.body.coordinates;
      if (req.body.battery !== undefined) updateData.battery = req.body.battery;
      if (req.body.speed !== undefined) updateData.speed = req.body.speed;
      if (req.body.status) updateData.status = req.body.status;

      const scooter = await Scooter.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!scooter) {
        return res.status(404).json({ error: "Scooter not found" });
      }

      res.json({
        message: "Scooter updated",
        scooter: scooter,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/scooters/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete scooter (admin only)
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *        description: Scooter ID
 *     responses:
 *       200:
 *         description: Scooter deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access, only Admin
 *       404:
 *         description: Scooter not found
 */
router.delete(
  "/admin/scooters/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const scooter = await Scooter.findByIdAndDelete(req.params.id);

      if (!scooter) {
        return res.status(404).json({ error: "Scooter not found" });
      }

      res.json({
        message: "Scooter deleted",
        scooterId: req.params.id,
        scooterName: scooter.name,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/rides:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all rides (admin only)
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: status
 *        schema:
 *          type: string
 *      - in: query
 *        name: userId
 *        schema:
 *          type: string
 *      - in: query
 *        name: limit
 *        schema:
 *          type: number
 *          default: 100
 *     responses:
 *       200:
 *         description: List of rides
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access, only Admin
 */
router.get(
  "/admin/rides",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { status, userId, limit = 100 } = req.query;
      const filter = {};

      if (status) filter.status = status;
      if (userId) filter.userId = userId;

      const rides = await Trip.find(filter)
        .populate("scooterId", "name city")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        count: rides.length,
        rides: rides,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * @swagger
 * /api/v1/admin/payments:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all payments (admin only)
 *     security:
 *      - bearerAuth: []
 *     parameters:
 *      - in: query
 *        name: userId
 *        schema:
 *          type: string
 *      - in: query
 *        name: limit
 *        schema:
 *          type: number
 *          default: 100
 *     responses:
 *       200:
 *         description: List of payments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: No access, only Admin
 */
router.get(
  "/admin/payments",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { userId, limit = 100 } = req.query;
      const filter = { status: "completed" };

      if (userId) filter.userId = userId;

      const payments = await Trip.find(filter)
        .populate("scooterId", "name")
        .select("userId scooterId cost startTime endTime createdAt")
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      const paymentsFormatted = payments.map((payment) => ({
        id: payment._id,
        userId: payment.userId,
        scooter: payment.scooterId?.name || "Unknown",
        amount: payment.cost,
        date: payment.endTime || payment.createdAt,
        tripDuration:
          payment.endTime && payment.startTime
            ? Math.round((payment.endTime - payment.startTime) / (1000 * 60))
            : 0,
      }));

      const totalIncome = payments.reduce((sum, p) => sum + (p.cost || 0), 0);

      res.json({
        count: paymentsFormatted.length,
        totalIncome: totalIncome,
        payments: paymentsFormatted,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
