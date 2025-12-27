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

// Define routes centraly
app.use('/', baseRoutes);
app.use('/api/v1', scooterRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;