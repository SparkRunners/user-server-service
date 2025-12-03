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
  res.send('Hello from Express! LIve NEw change testing MNow it works \n Check Api docs on route:  /api-docs/v1');
});

module.exports = router;