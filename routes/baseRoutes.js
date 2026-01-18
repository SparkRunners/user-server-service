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
router.get("/", (req, res) => {
  res.send(`<h1>Welcome to SparkRunners API</h1>
    <p>Server is running successfully!</p>
    
    <h2>Available endpoints:</h2>
    <h3>Public:</h3>
    <ul>
      <li><a href="/api/v1/status">/api/v1/status</a> - Health check</li>
      <li><a href="/api/v1/cities">/api/v1/cities</a> - Get all cities</li>
      <li><a href="/api/v1/pricing">/api/v1/pricing</a> - Get pricing information</li>
      <li><a href="/api/v1/scooters">/api/v1/scooters</a> - Get all scooters</li>
      <li>/api/v1/scooters/:id - Get scooter by ID (MongoDB ObjectId)</li>
      <li><a href="/api/v1/zones">/api/v1/zones</a> - Get all zones</li>
      <li><a href="/api/v1/zones/check?latitude=55.59&longitude=13.00">/api/v1/zones/check</a> - Check zone rules for location</li>
      <li><a href="/api/v1/stations">/api/v1/stations</a> - Get all charging stations</li>
    </ul>
    
    <h3>Protected (requires JWT):</h3>
    <ul>
      <li>POST /api/v1/rent/start/:id - Start rental</li>
      <li>POST /api/v1/rent/stop/:id - Stop rental</li>
      <li>GET /api/v1/rent/history - Get trip history</li>
      <li>GET /api/v1/rent/history:tripId - Get specfic trip history</li>
      <li>GET /api/v1/users/:id - Get user information</li>
      <li>GET /api/v1/users/:id/balance - Get user balance</li>
      <li>POST /api/v1/users/:id/fillup - Add money to balance</li>
      <li>POST /api/v1/scooters/:id/telemetry - Update scooter telemetry data</li>
    </ul>

    <h3>Admin (requires JWT + Admin role):</h3>
    <ul>
      <li>GET /api/v1/admin/users - List all users</li>
      <li>GET /api/v1/admin/scooters - List all scooters</li>
      <li>POST /api/v1/admin/scooters - Create scooter</li>
      <li>PUT /api/v1/admin/scooters/:id - Update scooter</li>
      <li>DELETE /api/v1/admin/scooters/:id - Delete scooter</li>
      <li>GET /api/v1/admin/rides - List all rides</li>
      <li>GET /api/v1/admin/payments - List all payments</li>
      <li>POST /api/v1/zones - Create zone</li>
      <li>PUT /api/v1/zones/:id - Update zone</li>
      <li>DELETE /api/v1/zones/:id - Delete zone</li>
    </ul>

    <h3>Simulation (real-time, in-memory):</h3>
    <ul>
      <li>POST /api/v1/simulation/start - Start scooter simulation</li>
      <li>POST /api/v1/simulation/stop - Stop scooter simulation</li>
      <li>GET <a href="/api/v1/simulation/state">/api/v1/simulation/state</a> - Get live scooter simulation data (JSON)</li>
    </ul>
    
    <h3>Documentation:</h3>
    <ul>
      <li><a href="/api-docs/v1">/api-docs/v1</a> - API Documentation (Swagger)</li>
    </ul>
  `);
  //res.send('Hello from Express! LIve NEw change testing MNow it works \n Check Api docs on route:  /api-docs/v1');
});

module.exports = router;
