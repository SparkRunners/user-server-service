const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

function setupSwagger(app) {
  const apiUrl = process.env.API_URL;;
  const options = {
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Express Documents API",
        version: "1.0.0",
        description: "API documentation for the user-server-service business logic micro-service",
      },
      servers: [
        { url: apiUrl, description: "Local server" }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        { bearerAuth: [] }
      ],
    },
    apis: ["./app.js",
      "./routes/baseRoutes.js",
      "./routes/scooterRoutes.js",
      "./routes/rentRoutes.js",
      "./routes/zoneRoutes.js",
      "./routes/citiesRoutes.js",
      "./routes/pricingRoutes.js",
      "./routes/userRoutes.js"

    ],
  };

  const specs = swaggerJsDoc(options);
  app.use("/api-docs/v1/", swaggerUi.serve, swaggerUi.setup(specs));
}

module.exports = setupSwagger;
