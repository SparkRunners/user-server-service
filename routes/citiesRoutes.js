const express = require("express");
const router = express.Router();
const City = require("../models/City");

/**
 * @swagger
 * /api/v1/cities:
 *   get:
 *     tags:
 *       - Cities
 *     summary: Get all available cities
 *     responses:
 *       200:
 *         description: List of cities
 */
router.get('/cities', async (req, res) => {
    try {
        const cities = await City.find({ active: true });

        const citiesFormatted = cities.map(city => ({
            name: city.name,
            country: city.country,
            coordinates: city.coordinates,
            timezone: city.timezone
        }));

        res.json({
            count: citiesFormatted.length,
            cities: citiesFormatted
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
