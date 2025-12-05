const express = require('express');
const router = express.Router();
const scooters = require('../mock-data/scooters.json');

/**
 * @swagger
 * /api/v1/status:
 *   get:
 *     tags:
 *       - System
 *     summary: Health check
 *     responses:
 *       200:
 *         description: Service is running
 *       500:
 *         description: Server error
 */
router.get('/status', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

/**
 * @swagger
 * /api/v1/scooters:
 *   get:
 *     tags:
 *       - Scooters
 *     summary: Get all scooters
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by status
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city
 *     responses:
 *       200:
 *         description: List of scooters
 *       500:
 *         description: Server error
 */
router.get('/scooters', (req, res) => {
    const { status, city } = req.query;
    let filtered = scooters;

    if (status) filtered = filtered.filter(s => s.status === status);
    if (city) filtered = filtered.filter(s => s.city === city);

    res.json(filtered);
});

/**
 * @swagger
 * /api/v1/scooters/{id}:
 *   get:
 *     tags:
 *       - Scooters
 *     summary: Get scooter by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Scooter ID
 *     responses:
 *       200:
 *         description: Scooter data
 *       404:
 *         description: Scooter not found
 *       500:
 *         description: Server error
 */
router.get('/scooters/:id', (req, res) => {
    const scooter = scooters.find(s => s.id === parseInt(req.params.id));
    if (!scooter) return res.status(404).json({ error: 'Not found' });
    res.json(scooter);
});

module.exports = router;