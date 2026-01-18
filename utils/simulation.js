const { Server } = require("socket.io");

/**
 * State of simulation
 */
let io = null;
let simulationInterval = null;
let scooters = [];

/**
 * Helper functions
 */

// Random speed between 0–20 km/t
function randomSpeed() {
    return Math.floor(Math.random() * 21);
}

// Get current scooters data
function getScooters() {
    return scooters;
}

// Generate a route with latitude & longitude objects
function generateRoute({ latitude, longitude }, steps = 20, stepSize = 0.0004) {
    const route = [];
    let lat = latitude;
    let lng = longitude;

    for (let i = 0; i < steps; i++) {
        lat += (Math.random() - 0.5) * stepSize;
        lng += (Math.random() - 0.5) * stepSize;
        route.push({ latitude: lat, longitude: lng });
    }

    return route;
}

/**
 * Generate scooters in cities
 */
function generateScooters(count = 1000) {
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

        const coordinates = {
            latitude: city.lat + (Math.random() - 0.5) * 0.02,
            longitude: city.lng + (Math.random() - 0.5) * 0.02
        };

        scooters.push({
            _id: i + 1,
            name: `SimScooter#${i + 1}`,
            city: city.name,
            battery: Math.floor(Math.random() * 100),
            status,
            speed,
            coordinates,
            route: generateRoute(coordinates),
            routeIndex: 0
        });
    }

    return scooters;
}

/**
 * Move scooters along their route
 */
function moveScooters(scooters) {
    scooters.forEach(scooter => {
        if (scooter.speed === 0) return;

        scooter.routeIndex = (scooter.routeIndex + 1) % scooter.route.length;

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

    scooters = generateScooters(scooterCount);

    // Start Socket.IO server once
    if (!io) {
        io = new Server(httpServer, { cors: { origin: "*" } });

        io.on("connection", socket => {
            console.log("Client connected to simulation");
            socket.emit("scooters:init", scooters);
        });
    }

    simulationInterval = setInterval(() => {
        moveScooters(scooters);
        io.emit("scooters:init", scooters);
    }, 3000);

    console.log(`Scooter simulation started (${scooterCount} scooters)`);

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
