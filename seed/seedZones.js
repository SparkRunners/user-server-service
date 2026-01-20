require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Zone = require("../models/Zone");
const { connectDB } = require("../db/database");

function loadGeoJSON(city) {
  const filePath = path.join(
    __dirname,
    "geojson",
    `${city.toLowerCase()}.json`
  );
  const data = fs.readFileSync(filePath, "utf8");
  return JSON.parse(data);
}

function convertGeoJSONToZones(geojson, city) {
  return geojson.features
    .filter(feature => {
      if (feature.properties.type === 'city') {
        return false;
      }
      return true;
    })
    .map((feature) => {
    const props = feature.properties;

    // Rules based on type
    let rules = {
      parkingAllowed: false,
      ridingAllowed: true,
      maxSpeed: 20,
    };

    switch (props.type) {
      case "parking":
        rules.parkingAllowed = true;
        rules.ridingAllowed = true;
        break;
      case "slow-speed":
        rules.parkingAllowed = false;
        rules.ridingAllowed = true;
        rules.maxSpeed = props.maxSpeed || 10;
        break;
      case "no-go":
        rules.parkingAllowed = false;
        rules.ridingAllowed = false;
        rules.maxSpeed = 0;
        break;
      case "charging":
        rules.parkingAllowed = true;
        rules.ridingAllowed = true;
        break;
      case "city":
        rules.parkingAllowed = true;
        rules.ridingAllowed = true;
        break;
    }

    return {
      name: props.name,
      type: props.type,
      city: city,
      description: `${props.name} in ${city}`,
      geometry: feature.geometry,
      rules: rules,
      priority: props.priority || 10,
    };
  });
}

async function seedZones() {
  try {
    console.log("Connecting to MongoDB.");
    await connectDB();
    console.log("Connecting to MongoDB.");

    // cities to seed
    const cities = ["Malmö", "Stockholm", "Göteborg"];

    for (const city of cities) {
      try {
        console.log(`\n Loading ${city}`);
        const geojson = loadGeoJSON(city);
        console.log(`Loaded finish for ${city}`);

        // remove current zones
        const deleteCurrentZones = await Zone.deleteMany({ city });
        console.log(`Removed ${deleteCurrentZones.deletedCount} current zones`);

        const zones = convertGeoJSONToZones(geojson, city);
        await Zone.insertMany(zones);
        console.log(`${zones.length} zones seeded for ${city}`);

        const zonesCreated = await Zone.find({ city });
        console.log("Zones created:");
        zonesCreated.forEach((z) => console.log(` ${z.name} (${z.type})`));
      } catch (error) {
        console.error(`Error seeding ${city}`, error.message);
      }
    }

    await mongoose.connection.close();
    console.log("\n Database connection closed");
  } catch (error) {
    console.error("Error seeding zones", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedZones();
