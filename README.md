# user-server-service
This repo contians all the business logic REST APIS for the Elsparkcykel app

REST API for Elsparkcykel app

# Install dependencies
npm install

# Start server
npm start

# Server runs on: http://localhost:3000

## API Endpoint (Mock API)

# Available Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/status` | Health check | - |
| GET | `/scooters` | Get all scooters | `city`, `status` |
| GET | `/scooters/:id` | Get specific scooter | - |

```json
[
  {
    "id": 1,
    "name": "SparkRunners#1",
    "city": "Stockholm",
    "coordinates": {
      "longitude": 18.0686,
      "latitude": 59.3293
    },
    "battery": 87,
    "speed": 0,
    "status": "Available"
  }
]

## Mock Data

- 20 scooters across Stockholm, Göteborg, and Malmö
- See `mock-data/scooters.json`
```