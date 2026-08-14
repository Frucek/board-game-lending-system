const express = require("express");

const {
    getGames,
    getGame
} = require("../gameCatalogClient");

const router = express.Router();

router.get("/games", async (req, res) => {

    try {

        const games = await getGames();

        res.json(games);

    } catch (error) {

        console.error(
            "Game Catalog error:",
            error.message
        );

        res.status(502).json({
            error: "Game Catalog Service unavailable"
        });
    }
});

router.get("/games/:id", async (req, res) => {

    try {

        const game = await getGame(req.params.id);

        res.json(game);

    } catch (error) {

        res.status(502).json({
            error: "Game Catalog Service unavailable"
        });
    }
});

module.exports = router;