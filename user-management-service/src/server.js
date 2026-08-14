const express = require("express");
const swaggerUi = require("swagger-ui-express");

const app = require("./app");

const {
    initializeDatabase
} = require("./database");

const {
    connectBroker
} = require("./messageBroker");

const openapi = require("../docs/openapi.json");

const PORT = 3000;

initializeDatabase();

app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openapi)
);

connectBroker();

app.listen(PORT, () => {

    console.log(
        `User Management Service started on port ${PORT}`
    );

    console.log(
        `Swagger: http://localhost:${PORT}/api-docs`
    );
});