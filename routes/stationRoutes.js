const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');

/**
 * @swagger
 * /api/v1/stations:
 *   get:
 *     tags:
 *       - Stations
 *     summary: Get all charging stations
 *     parameters:
 *      - in: query
 *        name: city
 *        schema:
 *          type: string
 *        description: Filter by city
 *     responses:
 *       200:
 *         description: List of charging stations
 */
router.get("/stations", async (req, res) => {
    try {
        const { city } = req.query;
        const filter = {
            type: "charging",
            active: true,
        };

        if (city) filter.city = city;

        const stations = await Zone.find(filter);
        res.json({
            count: stations.length,
            stations: stations,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/stations/{id}:
 *   get:
 *     tags:
 *       - Stations
 *     summary: Get charging station by ID
 *     parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        schema:
 *          type: string
 *     responses:
 *       200:
 *         description: Station details
 *       400:
 *         description: Station not found
 */
router.get("/stations/:id", async (req, res) => {
    try {
        const station = await Zone.findOne({
            _id: req.params.id,
            type: "charging",
        })

        if (!station) {
            return res.status(404).json({ error: "Station not found" });
        }

        res.json({ station });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;