const express = require("express");
const router = express.Router();
const Zone = require("../models/Zone");
const { authenticateToken, requireAdmin } = require("../middleware/auth");

/**
 * @swagger
 * /api/v1/zones:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Get all zones
 *     parameters:
 *      - in: query
 *        name: type
 *        schema:
 *          type: string
 *        description: Filter by zone type (parking, no-go, ...)
 *      - in: query
 *        name: city
 *        schema:
 *          type: string
 *        description: Filter by city
 *     responses:
 *       200:
 *         description: List of zones
 */
router.get("/zones", async (req, res) => {
  try {
    const { type, city } = req.query;
    const filter = { active: true };

    if (type) filter.type = type;
    if (city) filter.city = city;

    const zones = await Zone.find(filter);

    res.json({
      count: zones.length,
      zones: zones,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/zones/check:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Check that location is in a zone
 *     parameters:
 *      - in: query
 *        name: latitude
 *        required: true
 *        schema:
 *          type: number
 *      - in: query
 *        name: longitude
 *        required: true
 *        schema:
 *          type: number
 *     responses:
 *       200:
 *         description: Information about Zone for location
 */
router.get("/zones/check", async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({
        error: "latitude and longitude query parameters required",
      });
    }

    const point = {
      type: "Point",
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
    };

    // Find all zones that contains that point
    const zones = await Zone.find({
      geometry: {
        $geoIntersects: {
          $geometry: point,
        },
      },
      active: true,
    });

    if (zones.length === 0) {
      return res.json({
        inZone: false,
        zonesCount: 0,
        zones: [],
        rules: {
          parkAllowed: false,
          rideAllowed: false,
          maxSpeed: 0,
          hasCharging: false
        },
        alert: 'Outside all zones, riding is not allowed'
      });
    }

    const parkAllowed = zones.every((zone) => zone.rules.parkingAllowed);
    const rideAllowed = zones.every((zone) => zone.rules.ridingAllowed);
    const speedLimit = zones.map((zone) => zone.rules.maxSpeed);
    const maxSpeed = Math.min(...speedLimit);

    const hasCharging = zones.some(zone => zone.type === 'charging');

    res.json({
      inZone: true,
      zonesCount: zones.length,
      zones: zones,
      rules: {
        parkAllowed: parkAllowed,
        rideAllowed: rideAllowed,
        maxSpeed: maxSpeed,
        hasCharging: hasCharging
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/zones:
 *   post:
 *     tags:
 *       - Zones
 *     summary: Create a new zone (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *         required: true
 *         content:
 *          application/json:
 *             schema:
 *              type: object
 *     responses:
 *      201:
 *          description: Zone created
 *      401:
 *          description: Unauthorized
 */
router.post("/zones", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const zone = new Zone(req.body);
    await zone.save();

    res.status(201).json({
      message: "Zone created",
      zone: zone,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/zones/{id}:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Get zone by ID
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Zone details
 *       404:
 *         description: Zone not found
 */
router.get("/zones/:id", async (req, res) => {
  try {
    const zone = await Zone.findById(req.params.id);

    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    res.json({ zone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/zones/{id}:
 *   put:
 *     tags:
 *       - Zones
 *     summary: Update a zone (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *     requestBody:
 *        required: true
 *        content:
 *          application/json:
 *              schema:
 *               type: object
 *     responses:
 *       200:
 *         description: Zone details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Zone not found
 */
router.put("/zones/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const zone = await Zone.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    res.json({
      message: "Zone updated",
      zone: zone,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/v1/zones/{id}:
 *   delete:
 *     tags:
 *       - Zones
 *     summary: Delete a zone (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Zone deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Zone not found
 */
router.delete("/zones/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const zone = await Zone.findByIdAndDelete(req.params.id);
    
    if (!zone) {
      return res.status(404).json({ error: "Zone not found" });
    }

    res.json({
      message: "Zone deleted",
      zone: zone,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
