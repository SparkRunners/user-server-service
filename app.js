const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
// Require databse constant
const { connectDB } = require('./db/database');
// Require util constants
const setupSwagger = require("./utils/swagger");
connectDB().catch(err => console.error("DB connect error", err));
setupSwagger(app);
// Redefine predefined routes
const baseRoutes = require('./routes/baseRoutes');

// Define routes centraly
app.use('/', baseRoutes);


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
