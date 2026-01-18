const express = require("express");
const router = express.Router();
const Scooter = require("../models/Scooter");
const { authenticateToken } = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/scooters/{id}/telemetry:
 *   post:
 *     tags:
 *       - Scooters
 *     summary: Update scooter telemetry data
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
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              coordinates:
 *                  type: object
 *                  properties:
 *                   latitude:
 *                    type: number
 *                   longitude:
 *                    type: number
 *              battery:
 *                type: number
 *                minimum: 0
 *                maximum: 100
 *              speed:
 *                type: number
 *                minimum: 0
 *              status:
 *               type: string
 *               enum: [Available, In use, Charging, Maintenance, Off]
 *     responses:
 *       200:
 *         description: Telemetry updated
 *       400:
 *         description: Data invalid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Scooter not found
 */
router.post("/scooters/:id/telemetry", authenticateToken, async (req, res) => {
  try {
    const { coordinates, battery, speed, status } = req.body;

    const scooter = await Scooter.findById(req.params.id);

    if (!scooter) {
      return res.status(404).json({ error: "Scooter not found" });
    }

    if (coordinates) {
      if (coordinates.latitude && coordinates.longitude) {
        scooter.coordinates.latitude = coordinates.latitude;
        scooter.coordinates.longitude = coordinates.longitude;
      }
    }

    if (battery !== undefined) {
      if (battery < 0 || battery > 100) {
        return res
          .status(400)
          .json({ error: "Battery have to be between 0 and 100" });
      }
      scooter.battery = battery;
    }

    if (speed !== undefined) {
      if (speed < 0) {
        return res.status(400).json({ error: "Speed cannot be negative" });
      }
      scooter.speed = speed;
    }

    if (status) {
      const scooterStatuses = [
        "Available",
        "In use",
        "Charging",
        "Maintenance",
        "Off",
      ];
      if (!scooterStatuses.includes(status)) {
        return res.status(400).json({
          error: "Invalid status",
          scooterStatuses,
        });
      }
      scooter.status = status;
    }
    await scooter.save();

    res.json({
      message: "Telemetry updated",
      scooter: {
        id: scooter._id,
        name: scooter.name,
        coordinates: scooter.coordinates,
        battery: scooter.battery,
        speed: scooter.speed,
        status: scooter.status,
        updatedAt: scooter.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
