const express = require("express");
const router = express.Router();

const {
    startSimulation,
    stopSimulation,
    getScooters
} = require("../utils/simulation");

/**
 * @swagger
 * /api/v1/simulation/start:
 *   post:
 *     tags:
 *       - Simulation
 *     summary: Start scooter simulation (in-memory, no database)
 *     description: Starts the real-time scooter simulation using Socket.IO. If the simulation is already running, it will not be started again.
 *     responses:
 *       200:
 *         description: Simulation started
 *       500:
 *         description: Server error
 */
router.post("/start", (req, res) => {
    startSimulation(req.app.get("httpServer"), 1000);
    res.json({ message: "Simulation started" });
});

/**
 * @swagger
 * /api/v1/simulation/stop:
 *   post:
 *     tags:
 *       - Simulation
 *     summary: Stop scooter simulation
 *     description: Stops the running scooter simulation without shutting down the server or affecting the database.
 *     responses:
 *       200:
 *         description: Simulation stopped
 *       500:
 *         description: Server error
 */

router.post("/stop", (req, res) => {
    stopSimulation();
    res.json({ message: "Simulation stopped" });
});

/**
 * @swagger
 * /api/v1/simulation/state:
 *   get:
 *     tags:
 *       - Simulation
 *     summary: Get a copy of live scooter simulation data
 *     description: Returns the current in-memory state of all simulated scooters. Intended for debugging, monitoring, or frontend polling.
 *     responses:
 *       200:
 *         description: Live simulation data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *                   example: 1000
 *                 scooters:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       city:
 *                         type: string
 *                       battery:
 *                         type: number
 *                       status:
 *                         type: string
 *                       speed:
 *                         type: number
 *                       coordinates:
 *                         type: object
 *                         properties:
 *                           latitude:
 *                             type: number
 *                           longitude:
 *                             type: number
 *       500:
 *         description: Server error
 */

router.get("/state", (req, res) => {
    res.json({
        count: getScooters().length,
        scooters: getScooters()
    });
});

module.exports = router;
