const express = require("express");
const router = express.Router();
const pricing = require("../config/pricing");

/**
 * @swagger
 * /api/v1/pricing:
 *   get:
 *     tags:
 *       - Pricing
 *     summary: Get current pricing
 *     responses:
 *       200:
 *         description: Pricing details
 */
router.get("/pricing", (req, res) => {
  res.json({
    currency: "SEK",
    startFee: pricing.startFee,
    perMinute: pricing.perMinute,
    parkingFee: pricing.parkingFee,
    description: {
      startFee: "One-time fee when starting a trip",
      perMinute: "Cost per minute of riding",
      parkingFee: "Extra fee for parking out of designated zones",
    },
  });
});

module.exports = router;
