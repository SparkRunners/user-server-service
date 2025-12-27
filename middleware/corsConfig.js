const cors = require("cors");

// Allowed origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
  'http://127.0.0.1:5173',
  "http://localhost:5174",          
  "http://localhost:4173",          
  "http://localhost:1337",          
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: This origin is not allowed by the Backend Server Policies"));
    }
  }
};

module.exports = cors(corsOptions);
module.exports.corsOptions = corsOptions;
