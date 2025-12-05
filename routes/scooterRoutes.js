const express = require('express');
const router = express.Router();
const scooters = require('../mock-data/scooters.json');

router.get('/status', (req, res) => {
    res.json({ status: 'ok', version: '1.0.0' });
});

router.get('/scooters', (req, res) => {
    const { status, city } = req.query;
    let filtered = scooters;

    if (status) filtered = filtered.filter(s => s.status === status);
    if (city) filtered = filtered.filter(s => s.city === city);

    res.json(filtered);
});

router.get('/scooters/:id', (req, res) => {
    const scooter = scooters.find(s => s.id === parseInt(req.params.id));
    if (!scooter) return res.status(404).json({ error: 'Not found' });
    res.json(scooter);
});

module.exports = router;