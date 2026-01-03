const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['parking', 'no-parking', 'slow-speed', 'no-go', 'charging'],
        required: true
    },
    city: {
        type: String,
        required: true
    },
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ['Polygon', 'Point'],
            required: true
        },
        coordinates: {
            type: mongoose.Schema.Types.Mixed,
            required: true
        }
    },
    rules: {
        ridingAllowed: {
            type: Boolean,
            default: true
        },
        parkingAllowed: {
            type: Boolean,
            default: true
        },
        maxSpeed: {
            type: Number,
            default: 20
        }
    },
    active: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

zoneSchema.index({ geometry: '2dsphere' });

module.exports = mongoose.model('Zone', zoneSchema);