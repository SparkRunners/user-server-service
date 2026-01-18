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

**Required:**
- 'PORT
```

## Database

**MongoDB** with Mongoose

- On startup if empty, 20 scooters are added to database.
- MongoDB ObjectId (`_id`) instead of integer `id`
- `createdAt`, `updatedAt` timestamps added automatically

---

## API Endpoints

**Base URL:** `http://localhost:3000/api/v1`

### Public Endpoints

| Method | Endpoint        | Description                         | Query Params            |
| ------ | --------------- | ----------------------------------- | ----------------------- |
| GET    | `/status`       | API status check                    | -                       |
| GET    | `/scooters`     | Get all scooters                    | `city`, `status`        |
| GET    | `/scooters/:id` | Get specific scooter (MongoDB \_id) | -                       |
| GET    | `/zones`        | Get all zones                       | `city`, `type`          |
| GET    | `/zones/check`  | Check zone rules for location       | `latitude`, `longitude` |
| GET    | `/zones/:id`    | Get specific zone                   | -                       |
| GET    | `/stations`     | Get all charging stations           | `city`                  |
| GET    | `/stations/:id` | Get specific charging station       | -                       |

### Protected Endpoints (Require JWT)

| Method | Endpoint                  | Description                   | Auth |
| ------ | ------------------------- | ----------------------------- | ---- |
| POST   | `/rent/start/:id`         | Start renting a scooter       | JWT  |
| POST   | `/rent/stop/:id`          | Stop renting a scooter        | JWT  |
| GET    | `/rent/history`           | Get user trip history         | JWT  |
| GET    | `/rent/history/:tripId`   | Get specific trip details     | JWT  |
| GET    | `/users/:id`              | Get user information          | JWT  |
| GET    | `/users/:id/balance`      | Get user balance              | JWT  |
| POST   | `/users/:id/fillup`       | Add money to user balance     | JWT  |
| POST   | `/scooters/:id/telemetry` | Update scooter telemetry data | JWT  |

### Admin Endpoints (Require JWT + Admin Role)

| Method | Endpoint              | Description                    | Auth        |
| ------ | --------------------- | ------------------------------ | ----------- |
| GET    | `/admin/users`        | List all users                 | JWT + Admin |
| GET    | `/admin/scooters`     | List all scooters              | JWT + Admin |
| POST   | `/admin/scooters`     | Create new scooter             | JWT + Admin |
| PUT    | `/admin/scooters/:id` | Update scooter                 | JWT + Admin |
| DELETE | `/admin/scooters/:id` | Delete scooter                 | JWT + Admin |
| GET    | `/admin/rides`        | List all rides                 | JWT + Admin |
| GET    | `/admin/payments`     | List all payments with revenue | JWT + Admin |
| POST   | `/zones`              | Create new zone                | JWT + Admin |
| PUT    | `/zones/:id`          | Update zone                    | JWT + Admin |
| DELETE | `/zones/:id`          | Delete zone                    | JWT + Admin |

### Query Parameters

**Scooters:**

- `?city=Stockholm` - Filter by city (Stockholm, Göteborg, Malmö)
- `?status=Available` - Filter by status (Available, In use, Charging, Maintenance, Off)

**Zones:**

- `?city=Stockholm` - Filter by city
- `?type=parking` - Filter by type (parking, charging, slow-speed, no-go)

**Stations:**

- `?city=Malmö` - Filter by city

### Examples

```bash
# Get all scooters
curl http://localhost:3000/api/v1/scooters

# Filter scooters by city
curl "http://localhost:3000/api/v1/scooters?city=Stockholm"

# Get specific scooter using MongoDB _id
curl http://localhost:3000/api/v1/scooters/694030d35d4b6014907b095f

# Get all zones
curl http://localhost:3000/api/v1/zones

# Get parking zones in Stockholm
curl "http://localhost:3000/api/v1/zones?city=Stockholm&type=parking"

# Check zone rules for a location
curl "http://localhost:3000/api/v1/zones/check?latitude=55.59&longitude=13.00"

# Get all charging stations
curl http://localhost:3000/api/v1/stations

# Get charging stations in Göteborg
curl "http://localhost:3000/api/v1/stations?city=Göteborg"

# Get user info (with JWT)
curl http://localhost:3000/api/v1/users/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get user balance (with JWT)
curl http://localhost:3000/api/v1/users/USER_ID/balance \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Fill up balance (with JWT)
curl -X POST http://localhost:3000/api/v1/users/USER_ID/fillup \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 500}'

# Admin: Get all users (with JWT admin token)
curl http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Admin: Update scooter status
curl -X PUT http://localhost:3000/api/v1/admin/scooters/SCOOTER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "Maintenance", "battery": 50}'

# Admin: Get payments with revenue
curl http://localhost:3000/api/v1/admin/payments \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

```

---

## Data Structure

### Scooter

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

### Zone

```json
{
  "_id": "677fa1234567890abcdef123",
  "name": "Parking – Center",
  "type": "parking",
  "city": "Stockholm",
  "description": "Parking – Center in Stockholm",
  "geometry": {
    "type": "Polygon",
    "coordinates": [[[18.05, 59.32], [18.09, 59.32], ...]]
  },
  "rules": {
    "parkingAllowed": true,
    "ridingAllowed": true,
    "maxSpeed": 20
  },
  "priority": 40,
  "active": true,
  "createdAt": "2025-01-04T10:00:00.000Z",
  "updatedAt": "2025-01-04T10:00:00.000Z"
}
```

### Zone Types

- **parking** - Parking zones (5 per city)
- **charging** - Charging stations (2 per city)
- **slow-speed** - Speed-restricted areas (1 per city)
- **no-go** - Restricted areas where riding/parking is forbidden (1 per city)

### Zone Check Response

```json
{
  "inZone": true,
  "zonesCount": 2,
  "zones": [...],
  "rules": {
    "parkAllowed": true,
    "rideAllowed": true,
    "maxSpeed": 10,
    "hasCharging": false
  }
}
```

### User

```json
{
  "userId": "695469b63491cb71beeee52e",
  "email": "user@example.com",
  "name": "John Doe",
  "balance": 1000,
  "active": true,
  "createdAt": "2026-01-07T18:00:03.377Z",
  "updatedAt": "2026-01-07T18:00:03.377Z"
}
```

### Trip

```json
{
  "_id": "6954494ffa6bb949199a37c3",
  "scooterId": "694030d35d4b6014907b096e",
  "userId": "675f1234567890abcdef1234",
  "startTime": "2025-12-30T21:51:11.671Z",
  "endTime": "2025-12-30T21:51:16.959Z",
  "startPosition": {
    "city": "Göteborg",
    "coordinates": {
      "longitude": 11.94,
      "latitude": 57.72
    }
  },
  "endPosition": {
    "city": "Göteborg",
    "coordinates": {
      "longitude": 11.94,
      "latitude": 57.72
    }
  },
  "distance": 0,
  "cost": 10,
  "status": "completed",
  "createdAt": "2025-12-30T21:51:11.682Z",
  "updatedAt": "2025-12-30T21:51:16.982Z"
}
```

# Update scooter telemetry (with JWT)

```json
curl -X POST http://localhost:3000/api/v1/scooters/SCOOTER_ID/telemetry \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "coordinates": {
      "latitude": 59.3333,
      "longitude": 18.0700
    },
    "battery": 75,
    "speed": 15,
    "status": "In use"
  }'

```

## Pricing

Rental pricing config is found in `config/pricing.js`:

- **Start fee:** 10 kr
- **Per minute:** 2.5 kr

---

## API Documentation

Swagger docs available at:

```
http://localhost:3000/api-docs/v1
```

---

## Scooter Simulation (Real-Time)

The server includes an in-memory scooter simulation for development and testing. This allows the frontend to receive live scooter positions in real-time via WebSocket.
The street data for Stockholm, Göteborg, and Malmö is extracted from OpenStreetMap using [Overpass Turbo](https://overpass-turbo.eu/)
 and exported as GeoJSON files. In the simulation, these files are processed into arrays of street coordinates, which are then used to generate scooters and their routes, ensuring they are placed only on streets and avoiding water or invalid areas.

### Features

- Uses GeoJSON street data from /mock-data/ for realistic positioning and routes.
- Simulates 1000 scooters by default across Stockholm, Göteborg, and Malmö.
- Each scooter has:
  - `_id`, `name`, `city`
  - `coordinates` (`latitude` & `longitude`)
  - `battery`, `speed`, `status`
  - `route` with multiple coordinates for movement simulation
- Scooters move along predefined routes every 3 seconds.
- Battery decreases gradually while moving.
- Supports real-time updates via Socket.IO (`scooters:init` event).
- `/api/v1/simulation/state` returns the current state for debugging.

### Endpoints

| Method | Endpoint                   | Description                            |
| ------ | -------------------------- | -------------------------------------- |
| POST   | `/api/v1/simulation/start` | Start the in-memory scooter simulation |
| POST   | `/api/v1/simulation/stop`  | Stop the simulation and clear scooters |
| GET    | `/api/v1/simulation/state` | Get the current scooters state         |

## Testing

```bash
npm test              # Run all tests with coverage
```

---

### Frontend Usage

- Connect to the server using **Socket.IO**:

```javascript
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to scooter simulation");
});

// Listen for live scooter updates
socket.on("scooters:init", (scooters) => {
  console.log("Received scooter data", scooters);
  // Update map or UI with new scooter positions
});

// Listen for generated users
socket.on("users:init", (users) => {
  console.log("Received users data", users);
  // Update userlist to display user info
});

```
