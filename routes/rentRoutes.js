const express = require('express');
const router = express.Router();
const Scooter = require('../models/Scooter');
const Trip = require('../models/Trip');
const { authenticateToken } = require('../middleware/auth');
const PRICING = require('../config/pricing');

/**
 * @swagger
 * /api/v1/rent/start/{id}:
 *   post:
 *     tags:
 *       - Rent
 *     summary: Start renting a scooter
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
 *         description: Trip successfully started
 *       400:
 *         description: Scooter not available
 *       401:
 *         description: Unauthorized - No token provided
 *       404:
 *         description: Scooter not found
 *       500:
 *         description: Server error
 */
router.post('/start/:id', authenticateToken, async (req, res) => {
    try {
        const scooter = await Scooter.findById(req.params.id);

      if (!scooter) {
            return res.status(404).json({ error: 'Scooter not found'});
        }

        if (scooter.status !== 'Available') {
            return res.status(400).json({
                error: 'Scooter is not available',
                currentStatus: scooter.status
            });
        }

        const trip = new Trip({
            scooterId: scooter._id,
            userId: req.user.id,
            startTime: new Date(),
            startPosition: {
                city: scooter.city,
                coordinates: {
                    longitude: scooter.coordinates.longitude,
                    latitude: scooter.coordinates.latitude
                }
            },
            status: 'active'
        });

        await trip.save();

        
        scooter.status = 'In use';
        scooter.speed = 10;
        await scooter.save();

        res.json({
            message: 'Trip started',
            trip: trip,
            scooter: {
                id: scooter._id,
                name: scooter.name,
                status: scooter.status
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/rent/stop/{id}:
 *   post:
 *     tags:
 *       - Rent
 *     summary: Stop renting a scooter
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
 *         description: Trip successfully stopped
 *       404:
 *         description: No active trip or Scooter not found
 *       500:
 *         description: Server error
 */
router.post('/stop/:id', authenticateToken, async (req, res) => {
    try {
        const scooter = await Scooter.findById(req.params.id);

        if (!scooter) {
            return res.status(404).json({ error: 'Scooter not found' });
        }
        // Check scooter if in use
        if (scooter.status !== 'In use') {
            return res.status(400).json({
                error: 'Scooter is not in use',
                currentStatus: scooter.status
            });
        }
        // Get active trip for scooter
        const trip = await Trip.findOne({
            scooterId: scooter._id,
            userId: req.user.id,
            status: 'active'
        });

        if (!trip) {
            return res.status(404).json({
                error: 'No active trip for scooter'
            })
        }

        // When stopped update trip
        trip.endTime = new Date();
        trip.endPosition = {
            city: scooter.city,
            coordinates: {
                longitude: scooter.coordinates.longitude,
                latitude: scooter.coordinates.latitude
            }
        };
        trip.status = 'completed';

        // trip duration
        const tripDuration = Math.round((trip.endTime - trip.startTime) / (1000 * 60));

        // trip cost
        trip.cost = PRICING.startFee + (tripDuration * PRICING.perMinute);

        await trip.save();

        // Update status for scooter when stopped
        scooter.status = 'Available';
        scooter.speed = 0;
        await scooter.save();

        res.json({
            message: 'Trip stopped',
            trip: {
                id: trip._id,
                duration: `${tripDuration} minutes`,
                cost: `${trip.cost} kr`,
                startTime: trip.startTime,
                endTime: trip.endTime
            },
            scooter: {
                id: scooter._id,
                name: scooter.name,
                status: scooter.status
            }
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;