const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Require util constants
const setupSwagger = require("./utils/swagger");


setupSwagger(app);
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
app.get('/', (req, res) => {
  res.send('Hello from Express! LIve NEw change testing MNow it works');
});

app.get('/docker', (req, res) => {
  res.send('Hello from auth-server-service-docker with live updating from volme!');
});

app.listen(PORT, () => {
  console.log(`Server running inside container on http://localhost:${PORT}`);
});
