const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    scooterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Scooter",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    startPosition: {
      city: String,
      coordinates: {
        longitude: Number,
        latitude: Number,
      },
    },
    endPosition: {
      city: String,
      coordinates: {
        longitude: Number,
        latitude: Number,
      },
    },
    parkingType: {
      type: String,
      enum: ["designated", "free", "forbidden"],
      default: "designated",
    },
    distance: {
      type: Number,
      default: 0,
    },
    cost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Trip", tripSchema);
