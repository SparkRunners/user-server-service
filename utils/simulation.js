const { Server } = require("socket.io");

/**
 * State of simulation
 */
let io = null;
let simulationInterval = null;
let scooters = [];
let users = [];



// Import geolocation data for each city
const stockholmData = require('../mock-data/stockholm.json');
const goteborgData = require('../mock-data/goteborg.json');
const malmoData = require('../mock-data/malmo.json');

// A constant to store raods of each city
const cityRoads = {
    Stockholm: stockholmData,
    Göteborg: goteborgData,
    Malmö: malmoData
};


/**
 * Helper functions
 */

// A function that extracts arrays of points from each street
function extractRoads(osmData) {
    return osmData.features
        .filter(f => f.geometry && f.geometry.type === 'LineString')
        .map(f => f.geometry.coordinates.map(coord => ({ longitude: coord[0], latitude: coord[1] })));
}
// function extractRoads(osmData) {
//     return osmData.features.flatMap(f => {
//         if (!f.geometry) return [];

//         if (f.geometry.type === 'LineString') {
//             return [f.geometry.coordinates.map(coord => ({
//                 longitude: coord[0],
//                 latitude: coord[1]
//             }))];
//         }

//         if (f.geometry.type === 'MultiLineString') {
//             return f.geometry.coordinates.map(line =>
//                 line.map(coord => ({
//                     longitude: coord[0],
//                     latitude: coord[1]
//                 }))
//             );
//         }

//         return [];
//     });
// }



// Precompute road arrays for all cities
const cityPolys = {};
for (const city in cityRoads) {
    cityPolys[city] = extractRoads(cityRoads[city]);
}


// Random speed between 0–20 km/t
function randomSpeed() {
    return Math.floor(Math.random() * 21);
}

// Get current scooters data
function getScooters() {
    return scooters;
}

// get random corridanates inside the city road routes arrays
function randomPointOnCity(cityName) {
    const roads = cityPolys[cityName];
    if (!roads || roads.length === 0) return { latitude: 0, longitude: 0 };

    const road = roads[Math.floor(Math.random() * roads.length)];

    const point = road[Math.floor(Math.random() * road.length)];

    return point;
}



// Generate a route on a road/ path
function generateRoute(start, cityName, steps = 20) {
    const roads = cityPolys[cityName];
    if (!roads || roads.length === 0) return [start];

    const road = roads[Math.floor(Math.random() * roads.length)];

    let startIndex = Math.floor(Math.random() * road.length);

    const route = [];

    for (let i = 0; i < steps; i++) {
        const idx = (startIndex + i) % road.length;
        route.push(road[idx]);
    }

    return route;
}



/**
 * Generate simulated users
 */
function generateUsers(count = 1000) {
    const usersList = [];
    for (let i = 0; i < count; i++) {
        usersList.push({
            _id: i + 1,
            name: `SimUser#${i + 1}`,
            email: `user${i + 1}@example.com`
        });
    }
    return usersList;
}


/**
 * Generate scooters in cities
 */
function generateScooters(count = 1000, usersList) {
    const cities = [
        { name: "Stockholm", lat: 59.3293, lng: 18.0686 },
        { name: "Göteborg", lat: 57.7089, lng: 11.9746 },
        { name: "Malmö", lat: 55.6050, lng: 13.0038 }
    ];

    const scooters = [];

    for (let i = 0; i < count; i++) {
        const city = cities[i % cities.length];

        const statusRoll = Math.random();
        let status = "Available";
        if (statusRoll < 0.1) status = "Maintenance";
        else if (statusRoll < 0.15) status = "Off";

        const speed = status === "Available" ? randomSpeed() : 0;

        const coordinates = randomPointOnCity(city.name);

        const assignedUser = usersList[i];

        scooters.push({
            _id: i + 1,
            name: `SimScooter#${i + 1}`,
            city: city.name,
            battery: Math.floor(Math.random() * 100),
            status,
            speed,
            coordinates,
            route: generateRoute(coordinates, city.name),
            routeIndex: 0,
            user: assignedUser
        });
    }

    return scooters;
}

/**
 * Move scooters along their route and generate a new one from current position
 */
function moveScooters(scooters) {
    scooters.forEach(scooter => {
        if (scooter.speed === 0) return;

        scooter.routeIndex++;

        if (scooter.routeIndex >= scooter.route.length) {
            scooter.route = generateRoute(
                scooter.coordinates,
                scooter.city
            );
            scooter.routeIndex = 0;
        }

        const { latitude, longitude } = scooter.route[scooter.routeIndex];
        scooter.coordinates = { latitude, longitude };

        scooter.battery = Math.max(scooter.battery - 0.05, 0);
    });
}


/**
 * Start simulation
 */
function startSimulation(httpServer, scooterCount = 1000) {
    if (simulationInterval) {
        console.log("Simulation already running");
        return;
    }

    users = generateUsers(scooterCount);

    scooters = generateScooters(scooterCount, users);

    // Start Socket.IO server once
    if (!io) {
        io = new Server(httpServer, { cors: { origin: "*" } });

        io.on("connection", socket => {
            console.log("Client connected to simulation");
            socket.emit("scooters:init", scooters);
            socket.emit("users:init", users);
        });
    }

    simulationInterval = setInterval(() => {
        moveScooters(scooters);
        io.emit("scooters:init", scooters);
    }, 3000);

    console.log(`Scooter simulation started (${scooterCount} scooters and users)`);

    return {
        stop: stopSimulation
    };
}

/**
 * Stop simulation
 */
function stopSimulation() {
    if (!simulationInterval) {
        console.log("Simulation is not running");
        return;
    }

    clearInterval(simulationInterval);
    simulationInterval = null;
    scooters = [];
    console.log("Scooter simulation stopped");
}

module.exports = {
    startSimulation,
    stopSimulation,
    getScooters
};
