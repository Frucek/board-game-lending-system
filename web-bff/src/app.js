const express = require("express");

const gameRoutes =
    require("./routes/games");

const userRoutes =
    require("./routes/users");

const borrowingRoutes =
    require("./routes/borrowings");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {

    res.json({
        service: "web-bff",
        status: "UP"
    });
});

app.use((req, res, next) => {
    console.log("BFF REQUEST:", req.method, req.originalUrl);
    next();
});

app.use(gameRoutes);
app.use(userRoutes);
app.use(borrowingRoutes);

module.exports = app;