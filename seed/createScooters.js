require("dotenv").config();
const mongoose = require("mongoose");
const Scooter = require("../models/Scooter");
const { connectDB } = require("../db/database");

async function createTestScooters() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    const testScooters = [
      {
        name: "SparkRunners#21",
        city: "Stockholm",
        battery: 100,
        speed: 0,
        status: "Available",
        coordinates: { latitude: 59.3341, longitude: 18.0623 },
      },
      {
        name: "SparkRunners#22",
        city: "Stockholm",
        battery: 100,
        speed: 0,
        status: "Available",
        coordinates: { latitude: 59.336, longitude: 18.064 },
      },
      {
        name: "SparkRunners#23",
        city: "Stockholm",
        battery: 100,
        speed: 0,
        status: "Available",
        coordinates: { latitude: 59.338, longitude: 18.06 },
      },
    ];

    const created = await Scooter.insertMany(testScooters);
    console.log(
      `Created ${created.length} test scooters:`,
      created.map((s) => s.name),
    );

    await mongoose.connection.close();
    console.log("Database connection closed");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

createTestScooters();
