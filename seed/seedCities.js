require("dotenv").config();
const mongoose = require("mongoose");
const City = require("../models/City");
const { connectDB } = require("../db/database");

const cities = [
    {
        name: 'Stockholm',
        country: 'Sweden',
        coordinates: {
            latitude: 59.3327,
            longitude: 18.0656
        },
        timezone: 'Europe/Stockholm',
    },
    {
        name: 'Göteborg',
        country: 'Sweden',
        coordinates: {
            latitude: 57.7089,
            longitude: 11.9746
        },
        timezone: 'Europe/Stockholm',
    },
     {
        name: 'Malmö',
        country: 'Sweden',
        coordinates: {
            latitude: 55.6050,
            longitude: 13.0038
        },
        timezone: 'Europe/Stockholm',
    }
];

async function seedCities() {
    try {
        console.log('Connect to MongoDB');
        await connectDB();
        console.log('Connected to MongoDB.');

        await City.deleteMany({});
        console.log('Cleared current cities');

        await City.insertMany(cities);
        console.log(`${cities.length} cities seeded`);

        const citiesList = await City.find({});
        console.log('\nCreated cities');
        citiesList.forEach(c => console.log(`${c.name}`));

        await mongoose.connection.close();
        console.log('Database close');
    } catch (error) {
        console.error('Error seeding cities:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

seedCities();

