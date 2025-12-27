# User-Server-Service

This repo contains all the business logic REST APIs for the Elsparkcykel app.
## Badges for Build status and code health
[![Node.js CI Refactoring branch](https://github.com/SparkRunners/user-server-service/actions/workflows/node-CI.js.yml/badge.svg)](https://github.com/SparkRunners/user-server-service/actions/workflows/node-CI.js.yml)

[![codecov](https://codecov.io/github/SparkRunners/user-server-service/branch/feature%2Fmiddleware/graph/badge.svg?token=4374H8W3UD)](https://codecov.io/github/SparkRunners/user-server-service)

## Quick Start
```bash
# Install dependencies
npm install

# Create .env file
touch .env

# Start server
npm start
```

Server runs on: http://localhost:3000

---

## Environment Variables

Create a `.env` file in the root directory:
```
Go to the vteam06-share.env in team folder.

Paste in information from ".env file for user-server-service" to the .env file
```

## Database

**MongoDB** with Mongoose

- On startup if empty, 20 scooters are added to database.
- MongoDB ObjectId (`_id`) instead of integer `id`
- `createdAt`, `updatedAt` timestamps added automatically

---

## API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/status` | API status check | - |
| GET | `/scooters` | Get all scooters | `city`, `status` |
| GET | `/scooters/:id` | Get specific scooter (MongoDB _id) | - |

### Query Parameters

- `?city=Stockholm` - Filter by city (Stockholm, Göteborg, Malmö)
- `?status=Available` - Filter by status (Available, In use, Charging, Maintenance, Off)

### Examples
```bash
# Get all scooters
curl http://localhost:3000/api/v1/scooters

# Filter by city
curl "http://localhost:3000/api/v1/scooters?city=Stockholm"

# Get specific scooter using MongoDB _id
curl http://localhost:3000/api/v1/scooters/694030d35d4b6014907b095f
```

---

## Data Structure
```json
{
  "_id": "694030d35d4b6014907b095f",
  "name": "SparkRunners#1",
  "city": "Stockholm",
  "coordinates": {
    "longitude": 18.0686,
    "latitude": 59.3293
  },
  "battery": 87,
  "speed": 0,
  "status": "Available",
  "createdAt": "2025-12-15T16:01:23.716Z",
  "updatedAt": "2025-12-15T16:01:23.716Z"
}
```

## API Documentation

Swagger docs available at:
```
http://localhost:3000/api-docs/v1
```

---