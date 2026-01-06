const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    country: {
        type: String,
        default: 'Sweden'
    },
    coordinates: {
        latitude: Number,
        longitude: Number
    },
    timezone: String,
    population: Number,
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('City', citySchema);