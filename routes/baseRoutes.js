const express = require("express");
const router = express.Router();

// GET / - fetch astring as a swager docs example
/**
 * @swagger
 * /:
 *   get:
 *     tags:
 *         - GEt basic data string
 *     summary: Get basic string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of documents
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', (req, res) => {
  res.send(`<h1>Welcome to SparkRunners API</h1>
    <p>Server is running successfully!</p><h2>Available endpoints:</h2>
    <ul>
      <li><a href="/api/v1/status">/api/v1/status</a> - Health check</li>
      <li><a href="/api/v1/scooters">/api/v1/scooters</a> - Get all scooters</li>
      <li><a href="/api/v1/scooters/1">/api/v1/scooters/1</a> - Get scooter by ID</li>
      <li><a href="/api-docs/v1">/api-docs/v1</a> - API Documentation (Swagger)</li>
    </ul>
  `)
    //res.send('Hello from Express! LIve NEw change testing MNow it works \n Check Api docs on route:  /api-docs/v1');
});

module.exports = router;