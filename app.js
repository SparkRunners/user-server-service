const express = require('express');
// const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("./middleware/corsConfig")

// Require databse constant
const { connectDB } = require('./db/database');
// Require util constants
const setupSwagger = require("./utils/swagger");


if (process.env.NODE_ENV !== "production") {
  app.use("/coverage", express.static("coverage/lcov-report"));
}


connectDB().catch(err => console.error("DB connect error", err));
//connectDB().catch(err => console.error("DB connect error", err));

// Setup Swagger
setupSwagger(app);

// Middleware
// NOTE: 
// If you get cor cross orgin data not allowed error then update in middleware/corConfig.js and add the localhost:PORT trying to acess the apis in user-server-service
app.use(cors);


app.use(express.json());

// Redefine predefined routes
const baseRoutes = require('./routes/baseRoutes');
const scooterRoutes = require('./routes/scooterRoutes');
const rentRoutes = require('./routes/rentRoutes');

// Define routes centraly
app.use('/', baseRoutes);
app.use('/api/v1', scooterRoutes);
app.use('/api/v1/rent', rentRoutes);

async function startServer() {
  // connect to databasea

  try {
    await connectDB()

  const Scooter = require('./models/Scooter');
  const count = await Scooter.countDocuments();

  if (count == 0) {
    console.log('Database is empty. Adding mock scooter data.');
    const scootersData = require('./mock-data/scooters.json');

    // eslint-disable-next-line no-unused-vars
    const scooters = scootersData.map(({ id: _, ...rest }) => rest);
    await Scooter.insertMany(scooters);
    console.log(`Added ${scooters.length} scooters.`);
  }

  // Start server
  app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
  
}

if (process.env.NODE_ENV !== "test") {
  startServer();
}

module.exports = app;