const mongoose = require('mongoose');

const scooterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    coordinates: {
        longitude: {
            type: Number,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        }
    },
    battery: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    speed: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Available', 'In use', 'Charging', 'Maintenance', 'Off'],
        default: 'Available'
    }
    }, {
        timestamps: true
    });

    module.exports = mongoose.model('Scooter', scooterSchema);