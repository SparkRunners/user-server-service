const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
// Require databse constant
const { connectDB } = require('./db/database');
// Require util constants
const setupSwagger = require("./utils/swagger");
//connectDB().catch(err => console.error("DB connect error", err));

// Setup Swagger
setupSwagger(app);

// Middleware
app.use(cors());
app.use(express.json());

// Redefine predefined routes
const baseRoutes = require('./routes/baseRoutes');
const scooterRoutes = require('./routes/scooterRoutes');

// Define routes centraly
app.use('/', baseRoutes);
app.use('/api/v1', scooterRoutes);

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

startServer();


